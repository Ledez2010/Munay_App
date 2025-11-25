const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol teacher
router.get('/dashboard', authenticate, requireRole('teacher'), adminController.getDashboardStats.bind(adminController));
router.get('/clients', authenticate, requireRole('teacher'), adminController.getClients.bind(adminController));
router.get('/clients/:domain', authenticate, requireRole('teacher'), adminController.getClientDetails.bind(adminController));

module.exports = router;

