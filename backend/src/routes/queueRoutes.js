const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Web format endpoints
router.post('/take', authenticateToken, queueController.takeTicket);
router.get('/my-status', authenticateToken, queueController.getMyQueueStatus);
router.get('/my-history', authenticateToken, queueController.getMyQueueHistory);
router.get('/history/:sectorId', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'), queueController.getQueueHistory);
router.get('/list/:sectorId', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'), queueController.getQueueList);
// Preferred: PATCH /api/queues/:queueId/status  body: { status, remarks? }
router.patch('/:queueId/status', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK'), queueController.updateQueueStatus);
// Legacy: PATCH /api/queues/status/:queueId
router.patch('/status/:queueId', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK'), queueController.updateQueueStatus);
router.post('/forward/:queueId', authenticateToken, authorizeRoles('OFFICER'), queueController.forwardTicket);
router.delete('/:queueId', authenticateToken, queueController.cancelTicket);
router.post('/register-walkin', authenticateToken, authorizeRoles('OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'), queueController.registerWalkIn);

// Mobile format aliases (for backward compatibility)
router.post('/', authenticateToken, queueController.takeTicket); // Alias for /take
router.get('/active', authenticateToken, queueController.getMyQueueStatus); // Alias for /my-status
router.get('/:queueId', authenticateToken, queueController.getQueueById); // New endpoint for mobile

module.exports = router;
