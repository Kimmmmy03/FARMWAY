'use strict';
const { User, Product, Order, Commission } = require('../models');
const sequelize = require('../config/database');
const { createError } = require('../middleware/errorHandler');

// ──────────────────────────────────────────────────────────
// POST /api/admin/verify-seller/:userId
// ──────────────────────────────────────────────────────────
exports.verifySeller = async (req, res) => {
    const user = await User.findByPk(req.params.userId);
    if (!user) throw createError(404, req.t('general.not_found'));
    if (user.role !== 'FARMER') throw createError(400, 'Only farmers can receive verified seller badge.');
    await user.update({ is_verified_seller: true, status: 'ACTIVE' });
    res.json({ success: true, message: 'Seller verified.', data: user });
};

// ──────────────────────────────────────────────────────────
// POST /api/admin/set-commission/:userId
// Set a custom commission rate for a specific farmer
// ──────────────────────────────────────────────────────────
exports.setFarmerCommission = async (req, res) => {
    const { rate } = req.body;
    const min = parseFloat(process.env.MIN_COMMISSION_RATE || '5');
    const max = parseFloat(process.env.MAX_COMMISSION_RATE || '10');
    if (rate < min || rate > max) throw createError(400, `Commission must be between ${min}% and ${max}%.`);

    const [updated] = await sequelize.query(
        'UPDATE user_profiles SET commission_rate = :rate WHERE user_id = :userId RETURNING *',
        { replacements: { rate, userId: req.params.userId }, type: sequelize.QueryTypes.UPDATE }
    );
    if (!updated) throw createError(404, req.t('general.not_found'));
    res.json({ success: true, data: updated });
};

// ──────────────────────────────────────────────────────────
// PATCH /api/admin/users/:userId/status
// ──────────────────────────────────────────────────────────
exports.updateUserStatus = async (req, res) => {
    const { status } = req.body;
    const user = await User.findByPk(req.params.userId);
    if (!user) throw createError(404, req.t('general.not_found'));
    await user.update({ status });
    res.json({ success: true, data: user });
};

// ──────────────────────────────────────────────────────────
// GET /api/admin/dashboard  — platform metrics
// ──────────────────────────────────────────────────────────
exports.dashboard = async (req, res) => {
    const [metrics] = await sequelize.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'FARMER') AS total_farmers,
      (SELECT COUNT(*) FROM users WHERE role = 'BUYER')  AS total_buyers,
      (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL AND status = 'ACTIVE') AS active_listings,
      (SELECT COUNT(*) FROM orders)  AS total_orders,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'DELIVERED') AS total_gmv,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM commissions) AS total_commission,
      (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') AS pending_orders
  `, { type: sequelize.QueryTypes.SELECT });

    res.json({ success: true, data: metrics });
};

// ──────────────────────────────────────────────────────────
// GET /api/admin/commissions  — all commission records
// ──────────────────────────────────────────────────────────
exports.listCommissions = async (req, res) => {
    const { payout_status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (payout_status) where.payout_status = payout_status;

    const { count, rows } = await Commission.findAndCountAll({
        where,
        include: [{ model: Order, as: 'order', attributes: ['id', 'invoice_number', 'total_amount', 'created_at'] }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ success: true, data: rows, pagination: { total: count } });
};

// ──────────────────────────────────────────────────────────
// PATCH /api/admin/commissions/:id/payout
// ──────────────────────────────────────────────────────────
exports.markCommissionPaid = async (req, res) => {
    const commission = await Commission.findByPk(req.params.id);
    if (!commission) throw createError(404, req.t('general.not_found'));
    await commission.update({ payout_status: 'PAID', payout_at: new Date() });
    res.json({ success: true, data: commission });
};
