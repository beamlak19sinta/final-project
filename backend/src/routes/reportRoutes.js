const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAdminReports } = require('../controllers/reportController');

router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAdminReports);

module.exports = router;
