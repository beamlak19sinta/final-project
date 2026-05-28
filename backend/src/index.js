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

/* =========================================================
   CORS FIX (IMPORTANT)
========================================================= */

app.use(cors({
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With'
    ]
}));

app.options('*', cors());

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   ROOT ROUTES
========================================================= */

app.get('/', (req, res) => {
    res.send('Backend running successfully');
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date()
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API working correctly',
        timestamp: new Date()
    });
});

/* =========================================================
   DATABASE CHECK
========================================================= */

app.get('/api/db-check', async (req, res) => {
    try {
        const prisma = require('./utils/prisma');

        const [
            userCount,
            serviceCount,
            sectorCount,
            queueCount,
            appointmentCount
        ] = await Promise.all([
            prisma.user.count(),
            prisma.service.count(),
            prisma.serviceSector.count(),
            prisma.queue.count(),
            prisma.appointment.count()
        ]);

        res.json({
            success: true,
            database: 'Connected',
            counts: {
                users: userCount,
                services: serviceCount,
                sectors: sectorCount,
                queues: queueCount,
                appointments: appointmentCount
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/* =========================================================
   API ROUTES
========================================================= */

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

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, '0.0.0.0', () => {

    const interfaces = os.networkInterfaces();
    const addresses = [];

    Object.values(interfaces).forEach((items) => {
        items.forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        });
    });

    console.log('====================================');
    console.log(`Server running on PORT ${PORT}`);
    console.log(`Local IPs: ${addresses.join(', ')}`);
    console.log('====================================');
});