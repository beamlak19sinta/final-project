const express = require('express');
const router = express.Router();

const queueController = require('../controllers/queueController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/* =======================
   TAKE TICKET
======================= */
router.post('/take', authenticateToken, queueController.takeTicket);
router.post('/', authenticateToken, queueController.takeTicket);

/* =======================
   MY QUEUE STATUS
======================= */
router.get('/my-status', authenticateToken, queueController.getMyQueueStatus);
router.get('/active', authenticateToken, queueController.getMyQueueStatus);

/* =======================
   QUEUE LIST (OFFICERS)
======================= */
router.get(
    '/list/:sectorId',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'),
    queueController.getQueueList
);

/* =======================
   UPDATE STATUS
======================= */
router.patch(
    '/:queueId/status',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK'),
    queueController.updateQueueStatus
);

/* =======================
   FORWARD
======================= */
router.post(
    '/forward/:queueId',
    authenticateToken,
    authorizeRoles('OFFICER'),
    queueController.forwardTicket
);

/* =======================
   WALK-IN
======================= */
router.post(
    '/register-walkin',
    authenticateToken,
    authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'),
    queueController.registerWalkIn
);

module.exports = router;