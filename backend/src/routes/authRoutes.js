const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authenticateToken, authController.logout); // Logout endpoint
router.patch('/profile', authenticateToken, authController.updateProfile);
router.patch('/password', authenticateToken, authController.changePassword);

module.exports = router;
