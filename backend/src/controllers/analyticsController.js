const prisma = require('../utils/prisma');

const getQueueAnalytics = async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        const now = new Date();
        const past = new Date();

        if (range === '24h') past.setHours(past.getHours() - 24);
        else if (range === '7d') past.setDate(past.getDate() - 7);
        else if (range === '30d') past.setDate(past.getDate() - 30);
        else if (range === '90d') past.setDate(past.getDate() - 90);

        // Date filter
        const dateFilter = { createdAt: { gte: past } };

        // 1. Total Served
        const completedCount = await prisma.queue.count({
            where: {
                status: 'COMPLETED',
                ...dateFilter
            }
        });

        // 2. No Shows / Rejected
        const rejectedCount = await prisma.queue.count({
            where: {
                status: 'REJECTED',
                ...dateFilter
            }
        });

        // 3. Average Wait/Processing Time
        // Prisma doesn't support avg on date diffs directly easily, so we fetch and calc for now (ok for smaller datasets)
        const completedTickets = await prisma.queue.findMany({
            where: { status: 'COMPLETED', ...dateFilter },
            select: { createdAt: true, updatedAt: true }
        });

        let totalDurationMs = 0;
        completedTickets.forEach(t => {
            totalDurationMs += (new Date(t.updatedAt) - new Date(t.createdAt));
        });
        const avgWaitTimeMs = completedTickets.length > 0 ? totalDurationMs / completedTickets.length : 0;
        const avgWaitTimeMinutes = Math.round(avgWaitTimeMs / 1000 / 60);

        // Mock change percentages for now as implementing prev period logic is complex
        res.json({
            served: { value: completedCount, change: '+0%' },
            waitTime: { value: `${avgWaitTimeMinutes}m`, change: '0m' },
            noShows: { value: rejectedCount, change: '+0%' }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch queue analytics', error: error.message });
    }
};

const getServicePerformance = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                _count: {
                    select: { queues: { where: { status: 'COMPLETED' } } }
                }
            }
        });

        // For real avg time per service, we'd need complex queries. 
        // Approximating or fetching subset.
        // For now, we'll map the count.

        const performance = services.map(s => ({
            name: s.name,
            total: s._count.queues,
            avgTime: '15m' // Placeholder until we have more data
        }));

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch service performance', error: error.message });
    }
};

const getPeakHours = async (req, res) => {
    // This requires raw SQL for efficient grouping by hour in many DBs, or fetching all timestamps.
    // Fetching timestamps for last 7 days.
    try {
        const now = new Date();
        const past = new Date();
        past.setDate(past.getDate() - 7);

        const tickets = await prisma.queue.findMany({
            where: { createdAt: { gte: past } },
            select: { createdAt: true }
        });

        const hourCounts = new Array(24).fill(0);
        tickets.forEach(t => {
            const hour = new Date(t.createdAt).getHours();
            hourCounts[hour]++;
        });

        // Normalize to percentage of max for the chart
        const max = Math.max(...hourCounts);
        const normalized = hourCounts.map(c => max === 0 ? 0 : Math.round((c / max) * 100));

        // Return simpler dataset for the UI (maybe just 8am to 6pm for the bar chart?)
        // UI expects an array of heights. Let's send 24h for flexibility or specific range.
        // The UI mock used about 8 bars. Let's send working hours 8-17 (9 hours)

        const workingHours = normalized.slice(8, 18);
        res.json(workingHours);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch peak hours', error: error.message });
    }
};

const getSystemOverview = async (req, res) => {
    try {
        const [
            totalAppointments,
            pendingAppointments,
            scheduledAppointments,
            totalRequests,
            pendingRequests,
            processingRequests,
            totalQueues,
            activeQueues
        ] = await Promise.all([
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'PENDING' } }),
            prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
            prisma.serviceRequest.count(),
            prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
            prisma.serviceRequest.count({ where: { status: 'PROCESSING' } }),
            prisma.queue.count(),
            prisma.queue.count({ where: { status: { in: ['WAITING', 'CALLING', 'PROCESSING'] } } })
        ]);

        res.json({
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments,
                scheduled: scheduledAppointments
            },
            requests: {
                total: totalRequests,
                pending: pendingRequests,
                processing: processingRequests
            },
            queues: {
                total: totalQueues,
                active: activeQueues
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch system overview', error: error.message });
    }
};

const getAdminDashboardAnalytics = async (_req, res) => {
    try {
        const feedback = await prisma.feedback.findMany({
            select: { rating: true, createdAt: true }
        });

        const totalFeedback = feedback.length;
        const ratingsOnly = feedback.filter((item) => Number.isInteger(item.rating)).map((item) => item.rating);
        const averageRating = ratingsOnly.length
            ? Number((ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length).toFixed(2))
            : 0;

        const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
            rating: `${star} Star`,
            value: ratingsOnly.filter((value) => value === star).length,
        }));

        const sentiment = {
            positive: ratingsOnly.filter((value) => value >= 4).length,
            neutral: ratingsOnly.filter((value) => value === 3).length,
            negative: ratingsOnly.filter((value) => value <= 2).length,
        };

        const feedbackByDateMap = feedback.reduce((acc, item) => {
            const key = item.createdAt.toISOString().slice(0, 10);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const feedbackTimeline = Object.keys(feedbackByDateMap)
            .sort()
            .map((date) => ({ date, count: feedbackByDateMap[date] }));

        const highestRatedMap = feedback.reduce((acc, item) => {
            const key = item.createdAt.toISOString().slice(0, 10);
            if (Number.isInteger(item.rating) && item.rating >= 4) {
                acc[key] = (acc[key] || 0) + 1;
            }
            return acc;
        }, {});

        const highestRatedTrend = Object.keys(highestRatedMap)
            .sort()
            .map((date) => ({ date, count: highestRatedMap[date] }));

        const [topAppointmentServices, queueStats, onlineRequestsCount] = await Promise.all([
            prisma.appointment.groupBy({
                by: ['serviceId'],
                _count: { serviceId: true },
                orderBy: { _count: { serviceId: 'desc' } },
                take: 5
            }),
            prisma.queue.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            prisma.serviceRequest.count({
                where: { service: { mode: 'ONLINE' } }
            })
        ]);

        const appointmentServiceIds = topAppointmentServices.map((item) => item.serviceId);
        const appointmentServices = appointmentServiceIds.length
            ? await prisma.service.findMany({
                where: { id: { in: appointmentServiceIds } },
                select: { id: true, name: true }
            })
            : [];

        const serviceNameMap = appointmentServices.reduce((acc, service) => {
            acc[service.id] = service.name;
            return acc;
        }, {});

        const appointmentUsage = topAppointmentServices.map((item) => ({
            name: serviceNameMap[item.serviceId] || 'Unknown Service',
            count: item._count.serviceId
        }));

        const queueUsage = queueStats.map((item) => ({
            status: item.status,
            count: item._count.status
        }));

        res.json({
            feedback: {
                totalFeedback,
                averageRating,
                highestRatedFeedbackCount: ratingsOnly.filter((value) => value >= 4).length,
                ratingDistribution,
                sentiment: [
                    { name: 'Positive', value: sentiment.positive },
                    { name: 'Neutral', value: sentiment.neutral },
                    { name: 'Negative', value: sentiment.negative },
                ],
                timeline: feedbackTimeline,
                highestRatedTrend,
            },
            serviceUsage: {
                appointmentUsage,
                queueUsage,
                onlineRequestsCount,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admin dashboard analytics', error: error.message });
    }
};

module.exports = {
    getQueueAnalytics,
    getServicePerformance,
    getPeakHours,
    getSystemOverview,
    getAdminDashboardAnalytics
};
