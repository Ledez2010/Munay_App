const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateRegister, sanitizeBody } = require('../middleware/validation');

// Aplicar sanitización a todas las rutas
router.use(sanitizeBody);

router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/register', validateRegister, authController.register.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

module.exports = router;
