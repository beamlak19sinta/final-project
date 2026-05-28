const prisma = require('../utils/prisma');

/* =========================================================
   TAKE TICKET
========================================================= */
const takeTicket = async (req, res) => {
    console.log('[takeTicket] req.body:', req.body);
    const serviceIdRaw = req.body.serviceId || req.body.service_id;
    const userId = req.user.id;

    try {
        if (!serviceIdRaw || typeof serviceIdRaw !== 'string' || !serviceIdRaw.trim()) {
            return res.status(400).json({ message: 'serviceId is required' });
        }

        const serviceId = serviceIdRaw.trim();

        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.mode !== 'QUEUE') {
            return res.status(400).json({ message: 'Not a queue service' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingTicket = await prisma.queue.findFirst({
            where: {
                userId,
                createdAt: { gte: startOfDay },
                status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'Already in queue today' });
        }

        const ticketCount = await prisma.queue.count({
            where: {
                serviceId,
                createdAt: { gte: startOfDay }
            }
        });

        const queue = await prisma.queue.create({
            data: {
                ticketNumber: ticketCount + 1,
                userId,
                serviceId,
                status: 'WAITING'
            },
            include: { service: true }
        });

        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Queue Created',
                    message: `Ticket #${queue.ticketNumber} for ${queue.service.name}`,
                    type: 'QUEUE_ISSUED',
                    relatedId: queue.id
                }
            });
        } catch (e) {}

        res.status(201).json(queue);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   UPDATE QUEUE STATUS (ONLY ONE VERSION - FIXED)
========================================================= */
const updateQueueStatus = async (req, res) => {
    const { queueId } = req.params;
    const { status, remarks } = req.body;
    const officerId = req.user.id;

    const allowed = [
        'WAITING',
        'CALLING',
        'PROCESSING',
        'COMPLETED',
        'REJECTED',
        'CANCELLED'
    ];

    try {
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const queue = await prisma.queue.findUnique({
            where: { id: String(queueId) },
            include: { service: true, user: true }
        });

        if (!queue) {
            return res.status(404).json({ message: 'Queue not found' });
        }

        const updated = await prisma.queue.update({
            where: { id: String(queueId) },
            data: {
                status,
                officerId,
                remarks: remarks || null
            },
            include: { service: true, user: true }
        });

        // Notifications
        let title = '';
        let message = '';
        let type = '';

        if (status === 'CALLING') {
            title = 'Your Turn';
            message = `Proceed to ${updated.service.name}`;
            type = 'QUEUE_CALLED';
        }

        if (status === 'PROCESSING') {
            title = 'Processing';
            message = `Your request is being processed`;
            type = 'QUEUE_PROCESSING';
        }

        if (status === 'COMPLETED') {
            title = 'Completed';
            message = `Queue completed`;
            type = 'QUEUE_COMPLETED';
        }

        if (status === 'REJECTED') {
            title = 'Rejected';
            message = `Queue rejected`;
            type = 'QUEUE_REJECTED';
        }

        if (title) {
            await prisma.notification.create({
                data: {
                    userId: updated.userId,
                    title,
                    message,
                    type,
                    relatedId: updated.id
                }
            });
        }

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   GET MY QUEUE STATUS
========================================================= */
const getMyQueueStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        const queue = await prisma.queue.findFirst({
            where: {
                userId,
                status: { in: ['WAITING', 'CALLING', 'PROCESSING'] }
            },
            include: { service: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!queue) return res.json(null);

        const peopleAhead = await prisma.queue.count({
            where: {
                serviceId: queue.serviceId,
                status: 'WAITING',
                ticketNumber: { lt: queue.ticketNumber }
            }
        });

        res.json({ ...queue, peopleAhead });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   GET QUEUE LIST
========================================================= */
const getQueueList = async (req, res) => {
    const { sectorId } = req.params;

    try {
        const queues = await prisma.queue.findMany({
            where: {
                service: { sectorId },
                status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
            },
            include: { user: true, service: true },
            orderBy: { createdAt: 'asc' }
        });

        res.json(queues);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   FORWARD TICKET
========================================================= */
const forwardTicket = async (req, res) => {
    const { queueId } = req.params;
    const { targetSectorId, remarks } = req.body;

    try {
        const queue = await prisma.queue.findUnique({
            where: { id: queueId },
            include: { service: true }
        });

        if (!queue) return res.status(404).json({ message: 'Not found' });

        const targetService = await prisma.service.findFirst({
            where: { sectorId: targetSectorId }
        });

        if (!targetService) {
            return res.status(400).json({ message: 'No service in sector' });
        }

        const updated = await prisma.queue.update({
            where: { id: queueId },
            data: {
                serviceId: targetService.id,
                status: 'WAITING',
                remarks: remarks || 'Forwarded'
            }
        });

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   WALK-IN REGISTRATION
========================================================= */
const registerWalkIn = async (req, res) => {
    const { name, phoneNumber } = req.body;
    const serviceId = req.body.serviceId || req.body.service_id;
    const officerId = req.user.id;

    try {
        const user = await prisma.user.upsert({
            where: { phoneNumber },
            update: {},
            create: {
                name,
                phoneNumber,
                nationalId: `WALKIN-${Date.now()}`,
                password: 'WALKIN',
                role: 'CITIZEN'
            }
        });

        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const count = await prisma.queue.count({
            where: { serviceId, createdAt: { gte: startOfDay } }
        });

        const queue = await prisma.queue.create({
            data: {
                ticketNumber: count + 1,
                userId: user.id,
                serviceId,
                officerId,
                status: 'WAITING'
            },
            include: { service: true }
        });

        res.json(queue);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================================================
   EXPORTS
========================================================= */
module.exports = {
    takeTicket,
    updateQueueStatus,
    getMyQueueStatus,
    getQueueList,
    forwardTicket,
    registerWalkIn
};