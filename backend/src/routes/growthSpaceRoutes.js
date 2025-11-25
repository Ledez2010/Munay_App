const express = require('express');
const router = express.Router();
const growthSpaceController = require('../controllers/growthSpaceController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('teacher'), growthSpaceController.getGrowthSpaces.bind(growthSpaceController));
router.post('/', authenticate, requireRole('teacher'), growthSpaceController.createGrowthSpace.bind(growthSpaceController));
router.put('/:id', authenticate, requireRole('teacher'), growthSpaceController.updateGrowthSpace.bind(growthSpaceController));
router.delete('/:id', authenticate, requireRole('teacher'), growthSpaceController.deleteGrowthSpace.bind(growthSpaceController));

module.exports = router;





