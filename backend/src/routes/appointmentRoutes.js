const express = require('express');
const router = express.Router();

const {
    bookAppointment,
    getMyAppointments,
    getAvailableSlots,
    getSectorAppointments,
    cancelAppointment,
    updateAppointmentStatus
} = require('../controllers/appointmentController');

const { authenticateToken } = require('../middleware/auth');


// ========================
// ✅ APPOINTMENT ROUTES
// ========================

// 📌 Book appointment
router.post('/book', authenticateToken, bookAppointment);

// 📌 Get my appointments (frontend uses this)
router.get('/my', authenticateToken, getMyAppointments);

// 📌 Get sector appointments (officer/admin)
router.get('/sector/:sectorId', authenticateToken, getSectorAppointments);


// ========================
// ⏰ SLOT ROUTES
// ========================

// 📌 Get available slots (MAIN ONE - KEEP THIS)
router.get('/slots', authenticateToken, getAvailableSlots);
router.get('/slots/:serviceId/:date', authenticateToken, getAvailableSlots);


// ========================
// 🔄 UPDATE STATUS (REST shape + legacy path)
// ========================
// Preferred: PATCH /api/appointments/:appointmentId/status  body: { status }
router.patch('/:appointmentId/status', authenticateToken, updateAppointmentStatus);
// Legacy: PATCH /api/appointments/status/:appointmentId
router.patch('/status/:appointmentId', authenticateToken, updateAppointmentStatus);

// ========================
// ❌ CANCEL APPOINTMENT
// ========================
router.delete('/:appointmentId', authenticateToken, cancelAppointment);


// ========================
// 📦 EXPORT
// ========================
module.exports = router;