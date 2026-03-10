'use strict';
const { Payment, Order, Commission } = require('../models');
const { createError } = require('../middleware/errorHandler');
const sequelize = require('../config/database');

// ──────────────────────────────────────────────────────────
// POST /api/payments/initiate  — initiate payment for an order
// ──────────────────────────────────────────────────────────
exports.initiatePayment = async (req, res) => {
    const { order_id, method } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order) throw createError(404, req.t('orders.not_found'));
    if (order.buyer_id !== req.user.id) throw createError(403, req.t('auth.unauthorized'));
    if (order.status !== 'PENDING') throw createError(400, 'Order is not in a payable state.');

    // Check for an existing successful payment
    const existing = await Payment.findOne({ where: { order_id, status: 'SUCCESS' } });
    if (existing) throw createError(409, 'Order is already paid.');

    // Create the payment record
    const payment = await Payment.create({
        order_id,
        payer_id: req.user.id,
        amount: order.total_amount,
        method,
        status: 'PENDING',
        gateway_name: process.env.PAYMENT_GATEWAY || 'ipay88',
    });

    // ─── Gateway Placeholder ─────────────────────────────────
    // In production: call iPay88 / Billplz / Stripe API here and
    // return a redirect URL or checkout session ID.
    // The gateway will call back to POST /api/payments/callback.
    const checkoutPayload = {
        payment_id: payment.id,
        order_id: order.id,
        amount: payment.amount,
        currency: 'MYR',
        method,
        merchant_code: process.env.IPAY88_MERCHANT_CODE,
        callback_url: process.env.PAYMENT_CALLBACK_URL,
        description: `Farmway Order ${order.invoice_number}`,
        // redirect_url: '<gateway_redirect_url>' — populated by real gateway
        status: 'PENDING',
        message: 'Connect your payment gateway SDK here.',
    };

    res.status(201).json({ success: true, data: checkoutPayload });
};

// ──────────────────────────────────────────────────────────
// POST /api/payments/callback  — gateway webhook
// ──────────────────────────────────────────────────────────
exports.paymentCallback = async (req, res) => {
    // TODO: Verify gateway signature/HMAC before processing
    const { payment_id, status, gateway_txn_id, gateway_response } = req.body;

    const payment = await Payment.findByPk(payment_id);
    if (!payment) return res.status(404).json({ success: false });

    const isPaid = status === 'SUCCESS' || status === '1'; // gateway-dependent

    await sequelize.transaction(async (t) => {
        await payment.update(
            {
                status: isPaid ? 'SUCCESS' : 'FAILED',
                gateway_txn_id,
                gateway_response: gateway_response || {},
                paid_at: isPaid ? new Date() : null,
                failure_reason: !isPaid ? (gateway_response?.error || 'Payment declined') : null,
            },
            { transaction: t }
        );

        if (isPaid) {
            // Advance order to CONFIRMED
            await Order.update(
                { status: 'CONFIRMED' },
                { where: { id: payment.order_id }, transaction: t }
            );
            // Mark commission as confirmed
            await Commission.update(
                { payout_status: 'PENDING' }, // Released to farmer after delivery
                { where: { order_id: payment.order_id }, transaction: t }
            );
        }
    });

    res.json({ success: true });
};

// ──────────────────────────────────────────────────────────
// GET /api/payments/history  — transaction history (buyer or farmer)
// ──────────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));

    const where = req.user.role === 'BUYER' ? { payer_id: req.user.id } : {};
    // For farmers, join through orders
    const include = [{ model: Order, as: 'order', attributes: ['id', 'invoice_number', 'total_amount', 'farmer_id'] }];
    if (req.user.role === 'FARMER') {
        include[0].where = { farmer_id: req.user.id };
        include[0].required = true;
    }

    const { count, rows } = await Payment.findAndCountAll({
        where,
        include,
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
