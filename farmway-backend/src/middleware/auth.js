'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: req.t('auth.unauthorized') });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.sub);
        if (!user || user.status === 'SUSPENDED') {
            return res.status(401).json({ success: false, message: req.t('auth.unauthorized') });
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: req.t('auth.token_expired') });
        }
        return res.status(401).json({ success: false, message: req.t('auth.unauthorized') });
    }
};

/**
 * Role guard middleware factory
 * Usage: authorize('ADMIN') or authorize('FARMER', 'ADMIN')
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: req.t('auth.unauthorized') });
    }
    next();
};

module.exports = { authenticate, authorize };
