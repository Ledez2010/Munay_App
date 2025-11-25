const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, messageController.getMessages.bind(messageController));
router.post('/', authenticate, messageController.sendMessage.bind(messageController));
router.put('/:id/reply', authenticate, messageController.replyToMessage.bind(messageController));

module.exports = router;





