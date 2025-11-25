const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, userController.getUsers.bind(userController));
router.post('/', authenticate, requireRole('teacher'), userController.createUser.bind(userController));
router.post('/bulk', authenticate, requireRole('teacher'), userController.createBulkUsers.bind(userController));
router.get('/:id', authenticate, userController.getUserById.bind(userController));
router.put('/:id', authenticate, userController.updateUser.bind(userController));
router.delete('/:id', authenticate, requireRole('teacher'), userController.deleteUser.bind(userController));
router.get('/class/:classCode', authenticate, userController.getStudentsByClass.bind(userController));

module.exports = router;





