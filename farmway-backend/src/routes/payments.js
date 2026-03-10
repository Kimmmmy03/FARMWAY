'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

// Webhook — no auth (gateway signs request)
router.post('/callback', controller.paymentCallback);

// Authenticated routes
router.use(authenticate);

router.post('/initiate',
    body('order_id').isUUID(),
    body('method').isIn(['FPX', 'CREDIT_CARD', 'DEBIT_CARD', 'TNG_EWALLET', 'GRABPAY', 'DUITNOW', 'CASH_ON_DELIVERY']),
    validateRequest,
    controller.initiatePayment
);

router.get('/history', controller.getHistory);

module.exports = router;
