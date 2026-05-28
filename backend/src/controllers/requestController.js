const prisma = require('../utils/prisma');

const submitRequest = async (req, res) => {
    const { serviceId, data, remarks } = req.body;
    const userId = req.user.id;

    try {
        const request = await prisma.serviceRequest.create({
            data: {
                userId,
                serviceId,
                data: data || {},
                remarks,
                status: 'PENDING'
            },
            include: { service: true }
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit request', error: error.message });
    }
};

const getSectorRequests = async (req, res) => {
    const { sectorId } = req.params;
    try {
        const requests = await prisma.serviceRequest.findMany({
            where: {
                service: { sectorId }
            },
            include: { user: true, service: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sector requests', error: error.message });
    }
};

const getRequestHistory = async (req, res) => {
    const { sectorId } = req.params;
    try {
        const requests = await prisma.serviceRequest.findMany({
            where: {
                service: { sectorId },
                status: { in: ['COMPLETED', 'REJECTED'] }
            },
            include: { user: true, service: true },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch request history', error: error.message });
    }
};

const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, remarks } = req.body;
    const officerId = req.user.id;

    try {
        const request = await prisma.serviceRequest.update({
            where: { id: requestId },
            data: { status, remarks, officerId },
            include: { user: true, service: true }
        });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update request status', error: error.message });
    }
};

const getMyRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await prisma.serviceRequest.findMany({
            where: { userId },
            include: { service: { include: { sector: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch my requests', error: error.message });
    }
};

const getRequestById = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.id;
    try {
        const request = await prisma.serviceRequest.findFirst({
            where: { id: requestId },
            include: { user: true, service: { include: { sector: true } } }
        });
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch request', error: error.message });
    }
};

module.exports = { submitRequest, getSectorRequests, updateRequestStatus, getMyRequests, getRequestById, getRequestHistory };
