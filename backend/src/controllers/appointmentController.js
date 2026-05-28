const prisma = require('../utils/prisma');

// ========================
// 🔧 Helper: Date range fix
// ========================
const getDateRange = (dateStr) => {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

// ========================
// ✅ BOOK APPOINTMENT
// ========================
const bookAppointment = async (req, res) => {
    console.log('[bookAppointment] req.body:', req.body);
    const { date, appointmentDate, timeSlot } = req.body;
    const serviceIdRaw = req.body.serviceId || req.body.service_id;
    const bookingDate = date || appointmentDate;
    const userId = req.user.id;
    console.log('[bookAppointment] userId from token:', userId, '| serviceId:', serviceIdRaw, '| date:', bookingDate, '| timeSlot:', timeSlot);

    try {
        // ✅ Validate input
        if (!bookingDate) {
            return res.status(400).json({ message: 'Date is required' });
        }

        if (!serviceIdRaw || typeof serviceIdRaw !== 'string' || !serviceIdRaw.trim()) {
            return res.status(400).json({ message: 'Service ID is required' });
        }
        const serviceId = serviceIdRaw.trim();

        if (!timeSlot) {
            return res.status(400).json({ message: 'Time slot is required' });
        }

        const { start, end } = getDateRange(bookingDate);

        // ✅ Prevent duplicate booking same day
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                userId,
                date: { gte: start, lte: end },
                status: { in: ['PENDING', 'SCHEDULED'] }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: 'You already have an appointment for this day'
            });
        }

        // ✅ Check service
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.mode !== 'APPOINTMENT') {
            return res.status(400).json({ message: 'Selected service is not appointment-based' });
        }

        // ✅ Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                date: new Date(bookingDate),
                timeSlot,
                status: 'PENDING'
            },
            include: {
                service: {
                    include: { sector: true }
                }
            }
        });

        // ✅ Notification (safe)
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Appointment Request Received',
                    message: `Your appointment for ${appointment.service.name} is pending approval.`,
                    type: 'APPOINTMENT_REQUESTED',
                    relatedId: appointment.id
                }
            });
        } catch (notifErr) {
            console.warn('[bookAppointment] Notification failed (non-fatal):', notifErr.message);
        }

        res.status(201).json(appointment);

    } catch (error) {
        console.error("BOOK ERROR:", error);
        res.status(500).json({
            message: 'Failed to book appointment',
            error: error.message
        });
    }
};

// ========================
// ✅ GET MY APPOINTMENTS
// ========================
const getMyAppointments = async (req, res) => {
    const userId = req.user.id;
    console.log('[getMyAppointments] Fetching appointments for userId:', userId);

    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                service: {
                    include: { sector: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        console.log("User ID:", userId);
        console.log("Appointments:", appointments);

        res.json(appointments);

    } catch (error) {
        console.error("FETCH ERROR:", error);
        res.status(500).json({
            message: 'Failed to fetch appointments',
            error: error.message
        });
    }
};

// ========================
// ✅ GET SECTOR APPOINTMENTS
// ========================
const getSectorAppointments = async (req, res) => {
    const { sectorId } = req.params;

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                service: {
                    sectorId: sectorId.trim()
                }
            },
            include: {
                user: true,
                service: {
                    include: { sector: true }
                }
            },
            orderBy: [
                { date: 'asc' },
                { timeSlot: 'asc' }
            ]
        });

        res.json(appointments);

    } catch (error) {
        console.error("SECTOR ERROR:", error);
        res.status(500).json({
            message: 'Failed to fetch sector appointments',
            error: error.message
        });
    }
};

// ========================
// ✅ GET AVAILABLE SLOTS
// ========================
const getAvailableSlots = async (req, res) => {
    const serviceId = String(req.query.serviceId || req.params.serviceId || '').trim();
    const date = String(req.query.date || req.params.date || '').trim();

    if (!serviceId) {
        return res.status(400).json({ message: 'serviceId is required' });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
        return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
    }

    const slots = [
        "08:30 - 09:30",
        "09:30 - 10:30",
        "10:30 - 11:30",
        "14:00 - 15:00",
        "15:00 - 16:30"
    ];

    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true, mode: true },
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.mode !== 'APPOINTMENT') {
            return res.status(400).json({ message: 'Selected service is not appointment-based' });
        }

        const { start, end } = getDateRange(date);

        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                serviceId,
                date: { gte: start, lte: end },
                status: { in: ['PENDING', 'SCHEDULED'] }
            },
            select: { timeSlot: true }
        });

        const slotCounts = bookedAppointments.reduce((acc, a) => {
            acc[a.timeSlot] = (acc[a.timeSlot] || 0) + 1;
            return acc;
        }, {});

        const availableSlots = slots.filter(
            slot => (slotCounts[slot] || 0) < 3
        );

        res.json(availableSlots);

    } catch (error) {
        console.error("SLOT ERROR:", error);
        res.status(500).json({
            message: 'Failed to fetch slots',
            error: error.message
        });
    }
};

// ========================
// ❌ CANCEL APPOINTMENT
// ========================
const cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    try {
        const appointment = await prisma.appointment.findFirst({
            where: { id: String(appointmentId), userId }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (!['PENDING', 'SCHEDULED'].includes(appointment.status)) {
            return res.status(400).json({
                message: 'Only pending or scheduled appointments can be cancelled'
            });
        }

        await prisma.appointment.update({
            where: { id: String(appointmentId) },
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Appointment cancelled successfully' });

    } catch (error) {
        console.error("CANCEL ERROR:", error);
        res.status(500).json({
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
};

// ========================
// 🔄 UPDATE STATUS
// ========================
const updateAppointmentStatus = async (req, res) => {
    const { appointmentId } = req.params;
    const { status, rejectionReason } = req.body;

    console.log('[updateAppointmentStatus]');
    console.log('appointmentId:', appointmentId);
    console.log('status:', status);
    console.log('rejectionReason:', rejectionReason);

    const allowedStatuses = [
        'PENDING',
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED',
        'REJECTED'
    ];

    // ✅ Validate status
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Invalid appointment status'
        });
    }

    // ✅ Require rejection reason
    if (
        status === 'REJECTED' &&
        (!rejectionReason || !String(rejectionReason).trim())
    ) {
        return res.status(400).json({
            message: 'Rejection reason is required'
        });
    }

    try {

        // ✅ Check if appointment exists
        const existingAppointment = await prisma.appointment.findUnique({
            where: {
                id: String(appointmentId)
            },
            include: {
                service: true,
                user: true
            }
        });

        if (!existingAppointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        // ✅ Update appointment
        const updatedAppointment = await prisma.appointment.update({
            where: {
                id: String(appointmentId)
            },
            data: {
                status,
                rejectionReason:
                    status === 'REJECTED'
                        ? String(rejectionReason).trim()
                        : null
            },
            include: {
                service: true,
                user: true
            }
        });

        console.log('Appointment updated successfully');

        // =========================
        // 🔔 CREATE NOTIFICATION
        // =========================

        try {

            let notificationTitle = '';
            let notificationMessage = '';
            let notificationType = '';

            if (status === 'SCHEDULED') {
                notificationTitle = 'Appointment Approved';
                notificationMessage =
                    `Your appointment for ${updatedAppointment.service.name} has been approved.`;
                notificationType = 'APPOINTMENT_APPROVED';
            }

            if (status === 'COMPLETED') {
                notificationTitle = 'Appointment Completed';
                notificationMessage =
                    `Your appointment for ${updatedAppointment.service.name} has been completed.`;
                notificationType = 'APPOINTMENT_COMPLETED';
            }

            if (status === 'REJECTED') {
                notificationTitle = 'Appointment Rejected';
                notificationMessage =
                    `Your appointment for ${updatedAppointment.service.name} was rejected. Reason: ${rejectionReason}`;
                notificationType = 'APPOINTMENT_REJECTED';
            }

            if (status === 'CANCELLED') {
                notificationTitle = 'Appointment Cancelled';
                notificationMessage =
                    `Your appointment for ${updatedAppointment.service.name} has been cancelled.`;
                notificationType = 'APPOINTMENT_CANCELLED';
            }

            // ✅ Create notification only if needed
            if (notificationTitle) {
                await prisma.notification.create({
                    data: {
                        userId: updatedAppointment.userId,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: notificationType,
                        relatedId: updatedAppointment.id
                    }
                });

                console.log('Notification created');
            }

        } catch (notificationError) {
            console.error(
                'Notification creation failed:',
                notificationError.message
            );
        }

        // ✅ Success response
        return res.status(200).json({
            success: true,
            message: `Appointment updated to ${status}`,
            data: updatedAppointment
        });

    } catch (error) {

        console.error('UPDATE APPOINTMENT STATUS ERROR');
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update appointment status',
            error: error.message
        });
    }
};
/* ========================
   EXPORTS
======================== */
module.exports = {
    bookAppointment,
    getMyAppointments,
    getSectorAppointments,
    getAvailableSlots,
    cancelAppointment,
    updateAppointmentStatus
};