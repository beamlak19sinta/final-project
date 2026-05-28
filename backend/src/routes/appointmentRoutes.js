const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/auth');

/* =========================================
   BOOK APPOINTMENT
========================================= */
router.post(
    '/',
    authenticateToken,
    appointmentController.bookAppointment
);

/* =========================================
   MY APPOINTMENTS
========================================= */
router.get(
    '/my',
    authenticateToken,
    appointmentController.getMyAppointments
);

/* =========================================
   AVAILABLE SLOTS
========================================= */
router.get(
    '/slots',
    authenticateToken,
    appointmentController.getAvailableSlots
);

/* =========================================
   SECTOR APPOINTMENTS
========================================= */
router.get(
    '/sector/:sectorId',
    authenticateToken,
    authorizeRoles('OFFICER', 'ADMIN'),
    appointmentController.getSectorAppointments
);

/* =========================================
   UPDATE STATUS
========================================= */
router.patch(
    '/:appointmentId/status',
    authenticateToken,
    authorizeRoles('OFFICER', 'ADMIN'),
    appointmentController.updateAppointmentStatus
);

/* =========================================
   CANCEL APPOINTMENT
========================================= */
router.patch(
    '/cancel/:appointmentId',
    authenticateToken,
    appointmentController.cancelAppointment
);

module.exports = router;