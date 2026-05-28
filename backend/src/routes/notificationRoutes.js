const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/:userId', authenticateToken, notificationController.getNotifications);
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);
router.patch('/:notificationId/read', authenticateToken, notificationController.markAsRead);
router.delete('/:notificationId', authenticateToken, notificationController.deleteNotification);

module.exports = router;
