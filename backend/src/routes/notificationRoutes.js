const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('teacher'), notificationController.getNotifications.bind(notificationController));
router.get('/unread-count', authenticate, requireRole('teacher'), notificationController.getUnreadCount.bind(notificationController));
router.put('/:id/read', authenticate, requireRole('teacher'), notificationController.markAsRead.bind(notificationController));
router.put('/mark-read', authenticate, requireRole('teacher'), notificationController.markMultipleAsRead.bind(notificationController));

module.exports = router;



