const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const helpdeskController = require('../controllers/helpdeskController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getLogs);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Settings
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);
router.get('/questions', helpdeskController.getQuestions);
router.patch('/questions/:id/reply', helpdeskController.replyQuestion);

module.exports = router;
