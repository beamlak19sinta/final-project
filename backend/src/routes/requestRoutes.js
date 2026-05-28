const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

router.post('/submit', authenticateToken, requestController.submitRequest);
router.get('/my-requests', authenticateToken, requestController.getMyRequests);
router.get('/history/:sectorId', authenticateToken, requestController.getRequestHistory);
router.get('/sector/:sectorId', authenticateToken, requestController.getSectorRequests);
router.patch('/status/:requestId', authenticateToken, requestController.updateRequestStatus);
router.get('/:requestId', authenticateToken, requestController.getRequestById);

module.exports = router;
