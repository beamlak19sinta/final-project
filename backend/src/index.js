const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

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

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 Server starting...");

/* ================= CORS ================= */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

/* ================= BODY ================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ================= HEALTH ================= */
app.get('/', (req, res) => {
    res.send('Backend running successfully');
});

app.get('/api', (req, res) => {
    res.json({ success: true, message: 'API is running' });
});

/* ================= ROUTES ================= */
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/admin/reports', reportRoutes);

/* ================= 404 ================= */
app.use((req, res) => {
    console.log("❌ Route not found:", req.method, req.originalUrl);

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

/* ================= ERROR ================= */
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

/* ================= START ================= */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on PORT ${PORT}`);
});