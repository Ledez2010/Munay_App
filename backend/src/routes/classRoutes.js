const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, classController.getClasses.bind(classController));
router.get('/:code', authenticate, classController.getClassByCode.bind(classController));
router.post('/', authenticate, requireRole('teacher'), classController.createClass.bind(classController));
router.delete('/:code', authenticate, requireRole('teacher'), classController.deleteClass.bind(classController));

module.exports = router;





