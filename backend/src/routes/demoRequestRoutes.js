const express = require('express');
const router = express.Router();
const demoRequestController = require('../controllers/demoRequestController');
const { authenticate } = require('../middleware/auth');

router.post('/', demoRequestController.submitDemoRequest.bind(demoRequestController));
router.get('/', authenticate, demoRequestController.getDemoRequests.bind(demoRequestController));

module.exports = router;





