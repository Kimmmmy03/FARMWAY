'use strict';
const router = require('express').Router();
const { body, param } = require('express-validator');
const controller = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', controller.listConversations);
router.get('/unread-count', controller.unreadCount);
router.get('/:partnerId', param('partnerId').isUUID(), validateRequest, controller.getConversation);
router.post('/',
    body('recipient_id').isUUID(),
    body('message_type').optional().isIn(['TEXT', 'IMAGE', 'SYSTEM']),
    validateRequest,
    controller.sendMessage
);

module.exports = router;
