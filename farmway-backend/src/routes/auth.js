'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

const registerRules = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('full_name').trim().notEmpty().withMessage('Full name is required.'),
    body('role').optional().isIn(['FARMER', 'BUYER']),
    body('preferred_lang').optional().isIn(['en', 'ms', 'zh', 'ta']),
];

const loginRules = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
];

router.post('/register', registerRules, validateRequest, controller.register);
router.post('/login', loginRules, validateRequest, controller.login);
router.post('/refresh', controller.refresh);
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, controller.updateProfile);
router.patch('/change-password', authenticate, controller.changePassword);

module.exports = router;
