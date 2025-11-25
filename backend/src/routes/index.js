const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const classRoutes = require('./classRoutes');
const surveyRoutes = require('./surveyRoutes');
const activityRoutes = require('./activityRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const growthSpaceRoutes = require('./growthSpaceRoutes');
const rewardRoutes = require('./rewardRoutes');
const demoRequestRoutes = require('./demoRequestRoutes');
const adminRoutes = require('./adminRoutes');
const clientRoutes = require('./clientRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/surveys', surveyRoutes);
router.use('/activities', activityRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/growth-spaces', growthSpaceRoutes);
router.use('/rewards', rewardRoutes);
router.use('/demo-requests', demoRequestRoutes);
router.use('/admin', adminRoutes);
router.use('/clients', clientRoutes);

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Munay API - Backend completo',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      classes: '/api/classes',
      surveys: '/api/surveys',
      activities: '/api/activities',
      messages: '/api/messages',
      notifications: '/api/notifications',
      growthSpaces: '/api/growth-spaces',
      rewards: '/api/rewards',
      demoRequests: '/api/demo-requests',
      admin: '/api/admin',
      clients: '/api/clients'
    }
  });
});

module.exports = router;
