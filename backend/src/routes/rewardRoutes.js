const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, rewardController.getRewards.bind(rewardController));
router.post('/', authenticate, rewardController.awardReward.bind(rewardController));

module.exports = router;





