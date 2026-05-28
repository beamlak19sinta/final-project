const prisma = require('../utils/prisma');

const formatDate = (date) => date.toISOString().slice(0, 10);
const formatWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};
const formatMonth = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildTrendSeries = (items, period, length) => {
    const now = new Date();
    const series = [];
    for (let i = length - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        let label;
        if (period === 'weekly') {
            date.setDate(now.getDate() - i * 7);
            label = formatWeek(date);
        } else if (period === 'monthly') {
            date.setMonth(now.getMonth() - i);
            date.setDate(1);
            label = formatMonth(date);
        } else {
            date.setDate(now.getDate() - i);
            label = formatDate(date);
        }
        series.push({ label, appointments: 0, queues: 0 });
    }

    const indexByLabel = series.reduce((acc, item, index) => ({ ...acc, [item.label]: index }), {});

    items.forEach((item) => {
        let key;
        if (period === 'weekly') key = formatWeek(new Date(item.createdAt));
        else if (period === 'monthly') key = formatMonth(new Date(item.createdAt));
        else key = formatDate(new Date(item.createdAt));
        const idx = indexByLabel[key];
        if (idx !== undefined) {
            series[idx][item.type] += 1;
        }
    });

    return series;
};

const getAdminReports = async (_req, res) => {
    try {
        const [appointments, queues] = await Promise.all([
            prisma.appointment.findMany({
                select: {
                    createdAt: true,
                    status: true,
                    service: { select: { id: true, name: true } }
                }
            }),
            prisma.queue.findMany({
                select: {
                    createdAt: true,
                    status: true,
                    service: { select: { id: true, name: true } }
                }
            })
        ]);

        const appointmentByDay = {};
        appointments.forEach((item) => {
            const day = formatDate(item.createdAt);
            appointmentByDay[day] = (appointmentByDay[day] || 0) + 1;
        });

        const statusDistribution = Object.entries(
            appointments.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})
        ).map(([status, value]) => ({ status, value }));

        const queueUsage = Object.entries(
            queues.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})
        ).map(([status, count]) => ({ status, count }));

        const serviceCounts = {};
        [...appointments, ...queues].forEach((item) => {
            const serviceName = item.service?.name || 'Unknown Service';
            serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
        });

        const topServices = Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([name, count]) => ({ name, count }));

        const allTrackedItems = [
            ...appointments.map((item) => ({ ...item, type: 'appointments' })),
            ...queues.map((item) => ({ ...item, type: 'queues' }))
        ];

        const reportData = {
            summary: {
                totalAppointments: appointments.length,
                totalQueues: queues.length,
                activeQueues: queues.filter((q) => q.status === 'WAITING' || q.status === 'IN_PROGRESS').length,
                totalServices: topServices.length
            },
            trends: {
                daily: buildTrendSeries(allTrackedItems, 'daily', 14),
                weekly: buildTrendSeries(allTrackedItems, 'weekly', 8),
                monthly: buildTrendSeries(allTrackedItems, 'monthly', 6)
            },
            appointmentsPerDay: Object.entries(appointmentByDay)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date)),
            statusDistribution,
            queueUsage,
            topServices
        };

        return res.json({ success: true, data: reportData });
    } catch (error) {
        console.error('Admin report generation failed:', error);
        return res.status(500).json({ message: 'Failed to generate admin reports', error: error.message });
    }
};

module.exports = { getAdminReports };
