'use strict';
const { Message, User } = require('../models');
const { createError } = require('../middleware/errorHandler');
const { getPresignedReadUrl } = require('../config/s3');

// ──────────────────────────────────────────────────────────
// GET /api/messages  — conversation threads for current user
// ──────────────────────────────────────────────────────────
exports.listConversations = async (req, res) => {
    // Latest message per conversation partner
    const rows = await Message.findAll({
        where: {
            [require('sequelize').Op.or]: [
                { sender_id: req.user.id },
                { recipient_id: req.user.id },
            ],
        },
        include: [
            { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_s3_key'] },
            { model: User, as: 'recipient', attributes: ['id', 'full_name', 'avatar_s3_key'] },
        ],
        order: [['created_at', 'DESC']],
        limit: 50,
    });
    res.json({ success: true, data: rows });
};

// ──────────────────────────────────────────────────────────
// GET /api/messages/:partnerId  — chat with a specific user
// ──────────────────────────────────────────────────────────
exports.getConversation = async (req, res) => {
    const { partnerId } = req.params;
    const { order_id, page = 1, limit = 50 } = req.query;
    const { Op } = require('sequelize');

    const where = {
        [Op.or]: [
            { sender_id: req.user.id, recipient_id: partnerId },
            { sender_id: partnerId, recipient_id: req.user.id },
        ],
    };
    if (order_id) where.order_id = order_id;

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));

    const { count, rows } = await Message.findAndCountAll({
        where,
        order: [['created_at', 'ASC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
    });

    // Enrich image messages
    const messages = await Promise.all(
        rows.map(async (m) => {
            const obj = m.toJSON();
            if (obj.s3_key) obj.image_url = await getPresignedReadUrl(obj.s3_key);
            return obj;
        })
    );

    // Mark as read
    Message.update(
        { is_read: true, read_at: new Date() },
        { where: { sender_id: partnerId, recipient_id: req.user.id, is_read: false } }
    ).catch(() => { });

    res.json({
        success: true,
        data: messages,
        pagination: { total: count, page: pageNum, limit: pageSize, totalPages: Math.ceil(count / pageSize) },
    });
};

// ──────────────────────────────────────────────────────────
// POST /api/messages  — send a message
// ──────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
    const { recipient_id, content, order_id, product_id, message_type = 'TEXT', s3_key } = req.body;

    if (!content && !s3_key) throw createError(400, 'Message must have content or an image.');

    const message = await Message.create({
        sender_id: req.user.id,
        recipient_id,
        content,
        order_id,
        product_id,
        message_type,
        s3_key,
    });

    if (message.s3_key) message.dataValues.image_url = await getPresignedReadUrl(message.s3_key);

    res.status(201).json({ success: true, data: message });
};

// ──────────────────────────────────────────────────────────
// GET /api/messages/unread-count
// ──────────────────────────────────────────────────────────
exports.unreadCount = async (req, res) => {
    const count = await Message.count({ where: { recipient_id: req.user.id, is_read: false } });
    res.json({ success: true, data: { unread_count: count } });
};
