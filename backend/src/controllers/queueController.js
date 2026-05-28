const prisma = require('../utils/prisma');

const takeTicket = async (req, res) => {
    console.log('[takeTicket] req.body:', req.body);
    console.log('[takeTicket] userId from token:', req.user?.id);
    const serviceIdRaw = req.body.serviceId || req.body.service_id;
    const userId = req.user.id;

    try {
        // ✅ Validate serviceId is present
        if (!serviceIdRaw || typeof serviceIdRaw !== 'string' || !serviceIdRaw.trim()) {
            return res.status(400).json({ message: 'serviceId is required' });
        }
        const serviceId = serviceIdRaw.trim();

        // ✅ Confirm service exists in DB before touching Queue
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!service) {
            console.warn('[takeTicket] Service not found for id:', serviceId);
            return res.status(404).json({ message: `Service not found for id: ${serviceId}` });
        }
        if (service.mode !== 'QUEUE') {
            return res.status(400).json({ message: 'Selected service is not a queue-based service' });
        }

        // Check if user already has an active ticket for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingTicket = await prisma.queue.findFirst({
            where: {
                userId,
                createdAt: { gte: startOfDay },
                // ✅ CANCELLED tickets don't block re-queueing
                status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'You already have an active queue ticket' });
        }

        // Get the next ticket number for the day
        const ticketCount = await prisma.queue.count({
            where: {
                serviceId: service.id,
                createdAt: { gte: startOfDay }
            }
        });

        const ticketNumber = ticketCount + 1;

        const queue = await prisma.queue.create({
            data: {
                ticketNumber,
                userId,
                serviceId: service.id,
                status: 'WAITING'
            },
            include: { service: true }
        });

        console.log('[takeTicket] Queue created:', queue.id, 'ticket:', ticketNumber);

        // Create notification for user
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Queue Number Generated',
                    message: `Your ticket number for ${queue.service.name} is ${ticketNumber}.`,
                    type: 'QUEUE_ISSUED',
                    relatedId: queue.id
                }
            });
        } catch (notifErr) {
            console.warn('[takeTicket] Notification creation failed (non-fatal):', notifErr.message);
        }

        res.status(201).json(queue);
    } catch (error) {
        console.error('[takeTicket] Error:', error);
        res.status(500).json({ message: 'Failed to take ticket', error: error.message });
    }
};

// ========================
// 🔄 UPDATE QUEUE STATUS
// ========================
const updateQueueStatus = async (req, res) => {
    const { queueId } = req.params;
    const { status, remarks } = req.body;
    const officerId = req.user.id;

    console.log('[updateQueueStatus]');
    console.log('queueId:', queueId);
    console.log('status:', status);
    console.log('officerId:', officerId);

    const allowedStatuses = [
        'WAITING',
        'CALLING',
        'PROCESSING',
        'COMPLETED',
        'REJECTED',
        'CANCELLED'
    ];

    try {

        // ✅ Validate status
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid queue status'
            });
        }

        // ✅ Find queue first
        const existingQueue = await prisma.queue.findUnique({
            where: {
                id: String(queueId)
            },
            include: {
                service: true,
                user: true
            }
        });

        if (!existingQueue) {
            return res.status(404).json({
                success: false,
                message: 'Queue ticket not found'
            });
        }

        // ✅ Update queue safely
        const updatedQueue = await prisma.queue.update({
            where: {
                id: String(queueId)
            },
            data: {
                status,
                officerId,
                remarks: remarks || null
            },
            include: {
                service: true,
                user: true
            }
        });

        console.log('Queue updated successfully');

        // =========================
        // 🔔 CREATE NOTIFICATION
        // =========================

        try {

            let title = '';
            let message = '';
            let type = '';

            if (status === 'CALLING') {
                title = 'Your Turn';
                message =
                    `Please proceed to the counter for ${updatedQueue.service.name}.`;
                type = 'QUEUE_CALLED';
            }

            if (status === 'PROCESSING') {
                title = 'Queue Processing';
                message =
                    `Your request for ${updatedQueue.service.name} is now being processed.`;
                type = 'QUEUE_PROCESSING';
            }

            if (status === 'COMPLETED') {
                title = 'Queue Completed';
                message =
                    `Your queue request for ${updatedQueue.service.name} has been completed.`;
                type = 'QUEUE_COMPLETED';
            }

            if (status === 'REJECTED') {
                title = 'Queue Request Rejected';
                message =
                    `Your queue request for ${updatedQueue.service.name} was rejected.`;
                type = 'QUEUE_REJECTED';
            }

            if (title) {
                await prisma.notification.create({
                    data: {
                        userId: updatedQueue.userId,
                        title,
                        message,
                        type,
                        relatedId: updatedQueue.id
                    }
                });

                console.log('Queue notification created');
            }

        } catch (notifError) {
            console.error(
                'Notification error:',
                notifError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: `Queue updated to ${status}`,
            data: updatedQueue
        });

    } catch (error) {

        console.error('QUEUE STATUS UPDATE ERROR');
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update queue status',
            error: error.message
        });
    }
};
const updateQueueStatus = async (req, res) => {
    const { queueId } = req.params;
    const { status, remarks } = req.body;
    const officerId = req.user.id;

    try {
        const updateData = { status, officerId };
        if (remarks !== undefined) updateData.remarks = remarks;

        const queue = await prisma.queue.update({
            where: { id: queueId },
            data: updateData,
            include: { service: true }
        });

        // Create notification if status is CALLING
        if (status === 'CALLING') {
            try {
                await prisma.notification.create({
                    data: {
                        userId: queue.userId,
                        title: 'Your Turn!',
                        message: `Please proceed to the counter for ${queue.service.name}.`,
                        type: 'QUEUE_CALLED',
                        relatedId: queue.id
                    }
                });
            } catch (notifErr) {
                console.warn('[updateQueueStatus] Notification failed (non-fatal):', notifErr.message);
            }
        }

        res.json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update queue status', error: error.message });
    }
};

const forwardTicket = async (req, res) => {
    const { queueId } = req.params;
    const { targetSectorId, remarks } = req.body;
    const officerId = req.user.id;

    try {
        const queue = await prisma.queue.findUnique({
            where: { id: queueId },
            include: { service: true }
        });

        if (!queue) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Find a service in the target sector to assign the ticket to
        const targetService = await prisma.service.findFirst({
            where: { sectorId: targetSectorId }
        });

        if (!targetService) {
            return res.status(400).json({ message: 'Target sector has no services' });
        }

        const updatedQueue = await prisma.queue.update({
            where: { id: queueId },
            data: {
                serviceId: targetService.id,
                status: 'WAITING',
                officerId: null, // Reset officer so someone in the new sector can pick it up
                remarks: remarks || `Forwarded from ${queue.service.name}`
            }
        });

        res.json(updatedQueue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to forward ticket', error: error.message });
    }
};

const registerWalkIn = async (req, res) => {
    console.log('[registerWalkIn] req.body:', req.body);
    const { name, phoneNumber } = req.body;
    const serviceIdRaw = req.body.serviceId || req.body.service_id;
    const officerId = req.user.id;

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // ✅ Validate service before doing anything
        if (!serviceIdRaw || typeof serviceIdRaw !== 'string') {
            return res.status(400).json({ message: 'serviceId is required' });
        }
        const serviceId = serviceIdRaw.trim();
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return res.status(404).json({ message: `Service not found for id: ${serviceId}` });
        }
        if (service.mode !== 'QUEUE') {
            return res.status(400).json({ message: 'Selected service is not a queue-based service' });
        }

        // Find existing user by phone or create a walk-in placeholder
        let user = await prisma.user.findUnique({ where: { phoneNumber } });

        if (!user) {
            // Generate a unique placeholder nationalId for walk-in users
            // (nationalId is @unique in schema and required — cannot be omitted)
            const placeholderNationalId = `WALKIN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            user = await prisma.user.create({
                data: {
                    name,
                    phoneNumber,
                    nationalId: placeholderNationalId,
                    password: 'WALKIN_USER', // Dummy password
                    role: 'CITIZEN'
                }
            });
        }

        // Check if user already has an active ticket today
        const existingTicket = await prisma.queue.findFirst({
            where: {
                userId: user.id,
                createdAt: { gte: startOfDay },
                // ✅ CANCELLED tickets don't block re-queueing
                status: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
            }
        });

        if (existingTicket) {
            return res.status(400).json({ message: 'User already has an active ticket today' });
        }

        const ticketCount = await prisma.queue.count({
            where: { serviceId, createdAt: { gte: startOfDay } }
        });

        const queue = await prisma.queue.create({
            data: {
                ticketNumber: ticketCount + 1,
                userId: user.id,
                serviceId,
                officerId,
                status: 'WAITING'
            },
            include: { service: true, user: true }
        });

        res.status(201).json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Failed to register walk-in', error: error.message });
    }
};

const getMyQueueHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        // ✅ Exclude still-active tickets; show only terminal states
        const history = await prisma.queue.findMany({
            where: {
                userId,
                status: { in: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
            },
            include: { service: { include: { sector: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch queue history', error: error.message });
    }
};

const cancelTicket = async (req, res) => {
    const { queueId } = req.params;
    const userId = req.user.id;

    try {
        const queue = await prisma.queue.findFirst({
            where: { id: queueId, userId }
        });

        if (!queue) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (queue.status !== 'WAITING') {
            return res.status(400).json({ message: 'Only waiting tickets can be cancelled' });
        }

        // ✅ Update to CANCELLED instead of deleting — preserves history
        await prisma.queue.update({
            where: { id: queueId },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Ticket cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel ticket', error: error.message });
    }
};

const getQueueById = async (req, res) => {
    const { queueId } = req.params;
    const userId = req.user.id;

    try {
        const queue = await prisma.queue.findFirst({
            where: { id: queueId, userId },
            include: { service: { include: { sector: true } } }
        });

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: 'Queue not found'
            });
        }

        const peopleAhead = await prisma.queue.count({
            where: {
                serviceId: queue.serviceId,
                status: 'WAITING',
                createdAt: { lt: queue.createdAt }
            }
        });

        res.json({
            success: true,
            data: { ...queue, peopleAhead }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch queue',
            error: error.message
        });
    }
};

module.exports = { takeTicket, getMyQueueStatus, getQueueList, updateQueueStatus, registerWalkIn, cancelTicket, getMyQueueHistory, getQueueById, getQueueHistory, forwardTicket };

