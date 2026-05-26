const prisma = require('../utils/prisma');

const resolveRequestedUserId = (req) => {
    const paramUserId = req.params.userId;
    const authUserId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!paramUserId || paramUserId === authUserId || isAdmin) {
        return { userId: paramUserId || authUserId, forbidden: false };
    }
    return { userId: authUserId, forbidden: true };
};

const getNotifications = async (req, res) => {
    const { userId, forbidden } = resolveRequestedUserId(req);
    if (forbidden) {
        return res.status(403).json({ message: 'You can only view your own notifications' });
    }

    // Fallback logic for Prisma model naming discrepancies
    const notificationModel = prisma.notification || prisma.notifications;

    if (!notificationModel) {
        console.error('ERROR: Prisma Notification model not found in client. Available models:', Object.keys(prisma));
        return res.status(500).json({ message: 'Configuration error: Notification model not found' });
    }

    try {
        const notifications = await notificationModel.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await notificationModel.count({
            where: { userId, isRead: false }
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const notificationModel = prisma.notification || prisma.notifications;

    try {
        const notification = await notificationModel.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });

        if (notification.count === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    const notificationModel = prisma.notification || prisma.notifications;

    try {
        await notificationModel.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update notifications', error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const notificationModel = prisma.notification || prisma.notifications;

    try {
        const result = await notificationModel.deleteMany({
            where: { id: notificationId, userId }
        });

        if (result.count === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
