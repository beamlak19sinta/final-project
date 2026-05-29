const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   CORS (WEB + MOBILE SAFE)
========================= */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
    res.send('Backend is running 🚀');
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API working',
        time: new Date()
    });
});

/* =========================
   ROUTES IMPORT
========================= */
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const queueRoutes = require('./routes/queueRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const helpdeskRoutes = require('./routes/helpdeskRoutes');
const reportRoutes = require('./routes/reportRoutes');

/* =========================
   ROUTE MOUNTING
========================= */

// Auth
app.use('/api/auth', authRoutes);

// Services
app.use('/api/services', serviceRoutes);

// QUEUE (✔ FIXED)
app.use('/api/queues', queueRoutes);

// APPOINTMENTS (✔ FIXED IMPORTANT)
app.use('/api/appointments', appointmentRoutes);

// Requests
app.use('/api/requests', requestRoutes);

// Admin
app.use('/api/admin', adminRoutes);
app.use('/api/admin/reports', reportRoutes);

// Notifications
app.use('/api/notifications', notificationRoutes);

// Analytics
app.use('/api/analytics', analyticsRoutes);

// Feedback
app.use('/api/feedback', feedbackRoutes);

// Helpdesk
app.use('/api/helpdesk', helpdeskRoutes);

/* =========================
   DEBUG ROUTE (VERY IMPORTANT)
========================= */
app.get('/api/debug/routes', (req, res) => {
    res.json({
        success: true,
        routes: [
            '/api/appointments/book OR /api/appointments (depends on router)',
            '/api/queues/take',
            '/api/queues/my-status',
            '/api/services',
            '/api/auth'
        ]
    });
});

/* =========================
   404 HANDLER (IMPORTANT FOR DEBUG)
========================= */
app.use((req, res) => {
    console.log("❌ 404 NOT FOUND:", req.method, req.originalUrl);

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================');
    console.log(`🚀 Server running on PORT ${PORT}`);
    console.log('====================================');
});