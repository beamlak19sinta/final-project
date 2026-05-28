const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All analytics routes require Admin role
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/queue', analyticsController.getQueueAnalytics);
router.get('/services', analyticsController.getServicePerformance);
router.get('/peak-hours', analyticsController.getPeakHours);
router.get('/overview', analyticsController.getSystemOverview);
router.get('/admin-dashboard', analyticsController.getAdminDashboardAnalytics);

module.exports = router;
