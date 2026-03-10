'use strict';
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Order, OrderItem, Product, Payment, Commission, User } = require('../models');
const { createError } = require('../middleware/errorHandler');

// ──────────────────────────────────────────────────────────
// POST /api/orders  — Place a new order (BUYER)
// ──────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
    const { items, delivery_address, delivery_notes, buyer_notes, delivery_fee = 0, discount_amount = 0 } = req.body;
    // items: [{ product_id, quantity }]

    if (!items || items.length === 0) throw createError(400, 'Order must contain at least one item.');

    // All items must belong to the same farmer (one order per farmer)
    const products = await Product.findAll({
        where: { id: { [Op.in]: items.map((i) => i.product_id) }, status: 'ACTIVE' },
    });

    if (products.length !== items.length) throw createError(400, req.t('products.not_found'));

    const farmerIds = [...new Set(products.map((p) => p.farmer_id))];
    if (farmerIds.length > 1) throw createError(400, 'All items in an order must be from the same farmer.');

    const farmerId = farmerIds[0];

    // Calculate totals & validate stock
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
        const product = products.find((p) => p.id === item.product_id);
        if (product.stock_quantity < item.quantity) {
            throw createError(400, req.t('orders.insufficient_stock'));
        }
        const line_total = parseFloat(product.price_per_unit) * item.quantity;
        subtotal += line_total;
        orderItemsData.push({
            product_id: product.id,
            product_name: product.name,
            unit_price: product.price_per_unit,
            quantity: item.quantity,
            unit: product.unit,
            line_total,
        });
    }

    // Get farmer's commission rate
    const farmerProfile = await sequelize.query(
        'SELECT commission_rate FROM user_profiles WHERE user_id = :farmerId',
        { replacements: { farmerId }, type: sequelize.QueryTypes.SELECT }
    );
    const commission_rate = farmerProfile[0]?.commission_rate ?? parseFloat(process.env.DEFAULT_COMMISSION_RATE || '8');
    const commission_amount = parseFloat(((subtotal * commission_rate) / 100).toFixed(2));
    const total_amount = parseFloat((subtotal - discount_amount + parseFloat(delivery_fee)).toFixed(2));
    const farmer_payout = parseFloat((subtotal - commission_amount).toFixed(2));

    // Run in transaction for atomicity
    const order = await sequelize.transaction(async (t) => {
        const newOrder = await Order.create(
            {
                buyer_id: req.user.id,
                farmer_id: farmerId,
                subtotal_amount: subtotal,
                commission_amount,
                delivery_fee,
                discount_amount,
                total_amount,
                farmer_payout,
                delivery_address,
                delivery_notes,
                buyer_notes,
            },
            { transaction: t }
        );

        // Create order items
        const createdItems = await OrderItem.bulkCreate(
            orderItemsData.map((d) => ({ ...d, order_id: newOrder.id })),
            { transaction: t }
        );

        // Decrement stock
        for (const item of items) {
            await Product.decrement('stock_quantity', {
                by: item.quantity,
                where: { id: item.product_id },
                transaction: t,
            });
        }

        // Record commission
        await Commission.create(
            {
                order_id: newOrder.id,
                farmer_id: farmerId,
                gross_amount: subtotal,
                commission_rate,
                commission_amount,
                farmer_net_payout: farmer_payout,
            },
            { transaction: t }
        );

        newOrder.dataValues.items = createdItems;
        return newOrder;
    });

    res.status(201).json({ success: true, data: order });
};

// ──────────────────────────────────────────────────────────
// GET /api/orders  — Role-scoped list
// ──────────────────────────────────────────────────────────
exports.listOrders = async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));

    const where = {};
    if (req.user.role === 'BUYER') where.buyer_id = req.user.id;
    if (req.user.role === 'FARMER') where.farmer_id = req.user.id;
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
        where,
        include: [
            { model: OrderItem, as: 'items' },
            { model: User, as: 'buyer', attributes: ['id', 'full_name', 'phone'] },
            { model: User, as: 'farmer', attributes: ['id', 'full_name', 'phone'] },
        ],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
    });

    res.json({
        success: true,
        data: rows,
        pagination: { total: count, page: pageNum, limit: pageSize, totalPages: Math.ceil(count / pageSize) },
    });
};

// ──────────────────────────────────────────────────────────
// GET /api/orders/:id
// ──────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
    const order = await Order.findByPk(req.params.id, {
        include: [
            { model: OrderItem, as: 'items' },
            { model: Payment, as: 'payment' },
            { model: Commission, as: 'commission' },
            { model: User, as: 'buyer', attributes: ['id', 'full_name', 'phone', 'email'] },
            { model: User, as: 'farmer', attributes: ['id', 'full_name', 'phone', 'email'] },
        ],
    });

    if (!order) throw createError(404, req.t('orders.not_found'));

    // Access control
    const isParty = [order.buyer_id, order.farmer_id].includes(req.user.id);
    if (!isParty && req.user.role !== 'ADMIN') throw createError(403, req.t('auth.unauthorized'));

    res.json({ success: true, data: order });
};

// ──────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// ──────────────────────────────────────────────────────────
const FARMER_TRANSITIONS = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['PROCESSING'], PROCESSING: ['SHIPPED'], SHIPPED: ['DELIVERED'] };
const BUYER_TRANSITIONS = { PENDING: ['CANCELLED'], SHIPPED: ['DELIVERED'] };

exports.updateOrderStatus = async (req, res) => {
    const { status, cancelled_reason, tracking_number } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) throw createError(404, req.t('orders.not_found'));

    const allowed =
        req.user.role === 'FARMER' ? FARMER_TRANSITIONS[order.status] :
            req.user.role === 'BUYER' ? BUYER_TRANSITIONS[order.status] :
                Object.values(FARMER_TRANSITIONS).flat(); // ADMIN can do anything

    if (!allowed?.includes(status)) throw createError(400, req.t('orders.invalid_status'));

    const updates = { status };
    if (cancelled_reason) updates.cancelled_reason = cancelled_reason;
    if (cancelled_reason) updates.cancelled_by = req.user.id;
    if (tracking_number) updates.tracking_number = tracking_number;
    if (status === 'DELIVERED') updates.delivered_at = new Date();

    await order.update(updates);
    res.json({ success: true, data: order });
};

// ──────────────────────────────────────────────────────────
// GET /api/orders/:id/invoice
// ──────────────────────────────────────────────────────────
exports.getInvoice = async (req, res) => {
    const order = await Order.findByPk(req.params.id, {
        include: [
            { model: OrderItem, as: 'items' },
            { model: User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone'] },
            { model: User, as: 'farmer', attributes: ['id', 'full_name', 'email', 'phone'] },
            { model: Payment, as: 'payment' },
        ],
    });

    if (!order) throw createError(404, req.t('orders.not_found'));
    const isParty = [order.buyer_id, order.farmer_id].includes(req.user.id);
    if (!isParty && req.user.role !== 'ADMIN') throw createError(403, req.t('auth.unauthorized'));

    // Return invoice-ready JSON (frontend renders PDF)
    const invoice = {
        invoice_number: order.invoice_number,
        issued_at: order.created_at,
        order_id: order.id,
        buyer: order.buyer,
        seller: order.farmer,
        items: order.items,
        subtotal: order.subtotal_amount,
        delivery_fee: order.delivery_fee,
        discount: order.discount_amount,
        total: order.total_amount,
        payment_method: order.payment?.method,
        payment_status: order.payment?.status,
        delivery_address: order.delivery_address,
        platform: 'Farmway',
        platform_logo: 'https://farmway.my/logo.png',
    };

    res.json({ success: true, data: invoice });
};
