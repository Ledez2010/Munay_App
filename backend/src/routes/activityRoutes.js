const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, activityController.getActivities.bind(activityController));
router.post('/', authenticate, activityController.submitActivity.bind(activityController));

module.exports = router;





