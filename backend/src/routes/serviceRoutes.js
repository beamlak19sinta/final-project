// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Services routes
router.get('/', serviceController.getAllServices);
router.get('/catalog', serviceController.getUnifiedServiceCatalog);
router.get('/citizen', serviceController.getCitizenServices);
router.get('/support', serviceController.getSupportServices);
router.get('/helpdesk', serviceController.getSupportServices);
router.get('/sectors', serviceController.getAllSectors);
router.get('/:serviceId', serviceController.getServiceById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), serviceController.createService);
router.post('/sectors', authenticateToken, authorizeRoles('ADMIN'), serviceController.createSector);
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.updateService);
router.patch('/sectors/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.updateSector);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.deleteService);
router.delete('/sectors/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.deleteSector);

module.exports = router;