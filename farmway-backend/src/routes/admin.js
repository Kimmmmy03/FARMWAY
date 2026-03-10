'use strict';
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', controller.dashboard);
router.post('/verify-seller/:userId', param('userId').isUUID(), validateRequest, controller.verifySeller);
router.patch('/users/:userId/status', param('userId').isUUID(), body('status').isIn(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']), validateRequest, controller.updateUserStatus);
router.post('/set-commission/:userId', param('userId').isUUID(), body('rate').isFloat({ min: 0, max: 100 }), validateRequest, controller.setFarmerCommission);
router.get('/commissions', controller.listCommissions);
router.patch('/commissions/:id/payout', param('id').isUUID(), validateRequest, controller.markCommissionPaid);

module.exports = router;
