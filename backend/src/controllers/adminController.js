const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const getStats = async (req, res) => {
    try {
        const [users, queues, sectors, services] = await Promise.all([
            prisma.user.count({ where: { role: 'CITIZEN' } }),
            prisma.queue.count(),
            prisma.serviceSector.count(),
            prisma.service.count()
        ]);
        res.json({ users, queues, sectors, services });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                role: true,
                identificationNumber: true,
                nationalId: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        // Prevent self-deletion
        if (id === currentUserId) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        // Fetch target user to check role

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transactionally delete or update related records
        await prisma.$transaction(async (tx) => {
            // 1. Delete notifications (cascade)
            await tx.notification.deleteMany({ where: { userId: id } });

            // 2. Anonymize or delete logs (set userId to null)
            await tx.systemLog.updateMany({
                where: { userId: id },
                data: { userId: null }
            });

            // 3. Handle Queue records
            // If user is Citizen: delete queues (or keep them?) - usually delete active ones
            await tx.queue.deleteMany({ where: { userId: id } });

            // If user is Officer: remove officer assignment
            await tx.queue.updateMany({
                where: { officerId: id },
                data: { officerId: null }
            });

            // 4. Handle Appointments
            await tx.appointment.deleteMany({ where: { userId: id } });

            // 5. Handle Service Requests
            // Citizen requests
            await tx.serviceRequest.deleteMany({ where: { userId: id } });

            // Officer assignments
            await tx.serviceRequest.updateMany({
                where: { officerId: id },
                data: { officerId: null }
            });

            // Finally delete the user
            await tx.user.delete({ where: { id } });
        });

        res.json({ message: 'User and related data deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const currentUserId = req.user.id;

        if (!['CITIZEN', 'OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Fetch target user to check current role
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent changing own role or other admin's role
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ message: "Administrator roles cannot be modified." });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, role: true }
        });
        res.json({ message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user role', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, role, password } = req.body;
        const currentUserId = req.user.id;

        // Fetch target user 
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent modifying other admin accounts if not super admin (but we treat all admins equal for now)
        // Generally good to prevent an admin from hijacking another admin's account by changing password
        if (targetUser.role === 'ADMIN' && targetUser.id !== currentUserId) {
            // For now, allow edits but maybe restrict password change? 
            // Let's allow it for simplicity unless specified otherwise.
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        if (role) {
            if (!['CITIZEN', 'OFFICER', 'HELPDESK', 'HELP_DESK', 'ADMIN'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            // Prevent self-demotion from Admin
            if (id === currentUserId && role !== 'ADMIN') {
                return res.status(400).json({ message: 'You cannot remove your own admin status.' });
            }
            updateData.role = role;
        }

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, phoneNumber: true, role: true }
        });

        res.json({ message: 'User updated successfully', user });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};
const getSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        res.json({ message: 'Setting updated successfully', setting });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update setting', error: error.message });
    }
};

module.exports = { getStats, getUsers, getLogs, deleteUser, updateUserRole, updateUser, getSettings, updateSettings };
