const express = require('express');
const router = express.Router();

const queueController = require('../controllers/queueController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/* =========================================================
   CORE QUEUE ROUTES (CLEAN VERSION - NO CRASH)
========================================================= */

// 🔹 Take ticket
router.post(
    '/take',
    authenticateToken,
    queueController.takeTicket
);

// 🔹 Alias for mobile/web
router.post(
    '/',
    authenticateToken,
    queueController.takeTicket
);

// 🔹 Get current active queue status
router.get(
    '/my-status',
    authenticateToken,
    queueController.getMyQueueStatus
);

// 🔹 Alias for active status
router.get(
    '/active',
    authenticateToken,
    queueController.getMyQueueStatus
);

// 🔹 Get queue list for officers
router.get(
    '/list/:sectorId',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'),
    queueController.getQueueList
);

// 🔹 Update queue status (CALLING, PROCESSING, etc.)
router.patch(
    '/:queueId/status',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK'),
    queueController.updateQueueStatus
);

// 🔹 Forward ticket to another sector
router.post(
    '/forward/:queueId',
    authenticateToken,
    authorizeRoles('OFFICER'),
    queueController.forwardTicket
);

// 🔹 Register walk-in user (officer only)
router.post(
    '/register-walkin',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'),
    queueController.registerWalkIn
);

module.exports = router;