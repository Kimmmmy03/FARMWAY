'use strict';
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Centralized Express error handler — returns i18n-aware JSON errors
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    logger.error(err);

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: req.t('general.validation_error'),
            errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || req.t('general.server_error');
    res.status(statusCode).json({ success: false, message });
};

/**
 * express-validator result checker middleware
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: req.t('general.validation_error'),
            errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
        });
    }
    next();
};

/** Create a standard HTTP error */
const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
};

module.exports = { errorHandler, validateRequest, createError };
