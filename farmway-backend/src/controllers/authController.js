'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
const { createError } = require('../middleware/errorHandler');
const sequelize = require('../config/database');

/** Sign access + refresh token pair */
const signTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { sub: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = jwt.sign(
        { sub: userId, jti: uuidv4() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
    return { accessToken, refreshToken };
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    const { email, password, full_name, role = 'BUYER', phone, preferred_lang = 'en' } = req.body;

    const existing = await User.unscoped().findOne({ where: { email } });
    if (existing) throw createError(409, req.t('auth.email_taken'));

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password_hash, full_name, role, phone, preferred_lang });

    const { accessToken, refreshToken } = signTokens(user.id, user.role);

    res.status(201).json({
        success: true,
        data: {
            user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            accessToken,
            refreshToken,
        },
    });
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) throw createError(401, req.t('auth.invalid_credentials'));

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw createError(401, req.t('auth.invalid_credentials'));

    if (user.status === 'SUSPENDED') throw createError(403, req.t('auth.unauthorized'));

    // Update last_login_at
    await user.update({ last_login_at: new Date() });

    const { accessToken, refreshToken } = signTokens(user.id, user.role);

    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_verified_seller: user.is_verified_seller,
                preferred_lang: user.preferred_lang,
                avatar_s3_key: user.avatar_s3_key,
            },
            accessToken,
            refreshToken,
        },
    });
};

// ──────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ──────────────────────────────────────────────────────────
exports.refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError(400, 'Refresh token required.');

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.sub);
        if (!user) throw createError(401, req.t('auth.unauthorized'));

        const { accessToken, refreshToken: newRefresh } = signTokens(user.id, user.role);
        res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
    } catch {
        throw createError(401, req.t('auth.token_expired'));
    }
};

// ──────────────────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────────────────
exports.me = async (req, res) => {
    res.json({ success: true, data: req.user });
};

// ──────────────────────────────────────────────────────────
// PATCH /api/auth/me  (profile update)
// ──────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    const allowed = ['full_name', 'phone', 'preferred_lang', 'avatar_s3_key'];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    await req.user.update(updates);
    res.json({ success: true, data: req.user });
};

// ──────────────────────────────────────────────────────────
// PATCH /api/auth/change-password
// ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    const user = await User.scope('withPassword').findByPk(req.user.id);
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) throw createError(401, req.t('auth.invalid_credentials'));
    const password_hash = await bcrypt.hash(new_password, 12);
    await user.update({ password_hash });
    res.json({ success: true, message: req.t('general.success') });
};
