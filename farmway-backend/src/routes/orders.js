'use strict';
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

router.use(authenticate);

router.post('/',
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').isUUID(),
    body('items.*.quantity').isFloat({ min: 0.01 }),
    body('delivery_address').notEmpty(),
    validateRequest,
    controller.createOrder
);

router.get('/', controller.listOrders);
router.get('/:id', param('id').isUUID(), validateRequest, controller.getOrder);
router.get('/:id/invoice', param('id').isUUID(), validateRequest, controller.getInvoice);
router.patch('/:id/status',
    param('id').isUUID(),
    body('status').isIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    validateRequest,
    controller.updateOrderStatus
);

module.exports = router;
