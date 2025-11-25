const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { authenticate } = require('../middleware/auth');

router.get('/responses', authenticate, surveyController.getSurveyResponses.bind(surveyController));
router.post('/responses', authenticate, surveyController.submitSurveyResponse.bind(surveyController));

module.exports = router;





