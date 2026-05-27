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

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root and health check routes
app.get('/', (req, res) => {
  res.send('Backend running');
});

app.get('/api', (req, res) => {
  res.json({ status: 'Backend API is running', timestamp: new Date() });
});

// Simple test route for APK/network checks
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working', timestamp: new Date() });
});

// Diagnostic database connectivity and schema check
app.get('/api/db-check', async (req, res) => {
  try {
    const prisma = require('./utils/prisma');
    const [userCount, serviceCount, sectorCount, queueCount, appointmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.serviceSector.count(),
      prisma.queue.count(),
      prisma.appointment.count(),
    ]);
    const queueServices = await prisma.service.count({ where: { mode: 'QUEUE' } });
    const apptServices  = await prisma.service.count({ where: { mode: 'APPOINTMENT' } });
    const onlineServices = await prisma.service.count({ where: { mode: 'ONLINE' } });

    res.json({
      status: 'success',
      message: 'Database connection verified',
      counts: {
        users: userCount,
        sectors: sectorCount,
        services: serviceCount,
        servicesQUEUE: queueServices,
        servicesAPPOINTMENT: apptServices,
        servicesONLINE: onlineServices,
        queues: queueCount,
        appointments: appointmentCount,
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[DB CHECK ERROR]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database check failed',
      error: error.message,
      timestamp: new Date()
    });
  }
});


// API routes under /api
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  Object.values(networkInterfaces).forEach((interfaces) => {
    interfaces.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    });
  });

  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible on 0.0.0.0:${PORT}`);
  if (addresses.length > 0) {
    console.log(`Local network addresses: ${addresses.join(', ')}`);
  }

  // List registered routes for debugging
  if (app._router && app._router.stack) {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
        routes.push(`${methods} ${middleware.route.path}`);
      } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
            routes.push(`${methods} ${handler.route.path}`);
          }
        });
      }
    });
    console.log('Registered routes:');
    routes.forEach((r) => console.log(r));
  }
});
