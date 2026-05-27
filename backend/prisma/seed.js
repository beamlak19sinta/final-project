const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log("🔥 SEED STARTED");

    const sectorData = [
        {
            name: 'Citizen Service Center',
            description: 'In-office services for appointments and queue operations.',
            icon: 'Building2',
            services: [
                { name: 'Birth Certificate Appointment', description: 'Schedule birth certificate processing.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Marriage Certificate Appointment', description: 'Schedule marriage certificate processing.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'ID Card Renewal Appointment', description: 'Renew national ID card.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Digital ID Renewal Appointment', description: 'Renew digital identity.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Passport Application Appointment', description: 'Passport application service.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Revenue Services Appointment', description: 'Tax and revenue appointment.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Land Title Transfer Appointment', description: 'Land ownership transfer.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },

                { name: 'General Service Queue', description: 'General queue service.', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'ID Service Queue', description: 'ID-related queue.', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'Revenue Office Queue', description: 'Revenue queue service.', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'Land Service Queue', description: 'Land service queue.', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'Express Queue Service', description: 'Fast-track queue service.', mode: 'QUEUE', availability: 'Mon-Fri' }
            ]
        },
        {
            name: 'Help Desk Online Services',
            description: 'Online services portal.',
            icon: 'Globe',
            services: [
                { name: 'Title Transfer Online Service', description: 'Online land title transfer.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Birth Certificate Online Request', description: 'Online birth certificate request.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Marriage Certificate Online Request', description: 'Online marriage request.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Land Management Service', description: 'Manage land records online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Document Verification Service', description: 'Verify documents online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Complaint Submission Service', description: 'Submit complaints online.', mode: 'ONLINE', availability: '24/7' }
            ]
        },
        {
            name: 'Utility & Infrastructure Services',
            description: 'Utility connections and infrastructure services.',
            icon: 'Zap',
            services: [
                { name: 'Electricity Connection Request', description: 'New electricity connection.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Water Connection Request', description: 'New water connection.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Construction Permit Application', description: 'Building permit approval.', mode: 'APPOINTMENT', availability: 'Mon-Fri' }
            ]
        },
        {
            name: 'Business & Revenue Services',
            description: 'Business registration and tax services.',
            icon: 'Briefcase',
            services: [
                { name: 'Business License Registration', description: 'Register new business.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Tax Clearance Certificate', description: 'Tax clearance processing.', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
                { name: 'Property Valuation Service', description: 'Land/property valuation.', mode: 'APPOINTMENT', availability: 'Mon-Fri' }
            ]
        }
    ];

    for (const s of sectorData) {
        const sector = await prisma.serviceSector.upsert({
            where: { name: s.name },
            update: {},
            create: {
                name: s.name,
                description: s.description,
                icon: s.icon
            }
        });

        for (const svc of s.services) {
            // Find existing service by name and sectorId to avoid unique key lookup issues
            const existingService = await prisma.service.findFirst({
                where: { name: svc.name, sectorId: sector.id }
            });

            if (existingService) {
                await prisma.service.update({
                    where: { id: existingService.id },
                    data: {
                        description: svc.description,
                        mode: svc.mode,
                        availability: svc.availability
                    }
                });
            } else {
                await prisma.service.create({
                    data: {
                        name: svc.name,
                        description: svc.description,
                        mode: svc.mode,
                        availability: svc.availability,
                        sectorId: sector.id
                    }
                });
            }
        }
    }

    console.log("🧹 Clearing existing transaction data & users to avoid conflicts...");
    await prisma.systemLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.queue.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.serviceRequest.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.helpDeskQuestion.deleteMany({});
    await prisma.user.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const officerPassword = await bcrypt.hash('officer123', 10);
    const citizenPassword = await bcrypt.hash('password123', 10);
    const helpDeskPassword = await bcrypt.hash('1234', 10);

    const users = [
        {
            name: 'System Admin',
            phoneNumber: '0911000000',
            password: adminPassword,
            role: 'ADMIN',
            identificationNumber: 'ADM-001',
            nationalId: '1111111111111111'
        },
        {
            name: 'Custom Admin',
            phoneNumber: '0911111111',
            password: adminPassword,
            role: 'ADMIN',
            identificationNumber: 'ADM-CUSTOM-001',
            nationalId: '1111111111111112'
        },
        {
            name: 'Sample Officer',
            phoneNumber: '0900000000',
            password: officerPassword,
            role: 'OFFICER',
            identificationNumber: 'OFF-001',
            nationalId: '2222222222222222'
        },
        {
            name: 'Service Officer',
            phoneNumber: '0922000000',
            password: officerPassword,
            role: 'OFFICER',
            identificationNumber: 'OFF-002',
            nationalId: '2222222222222223'
        },
        {
            name: 'Sample Citizen',
            phoneNumber: '0909090909',
            password: citizenPassword,
            role: 'CITIZEN',
            identificationNumber: 'CIT-001',
            nationalId: '4444444444444444'
        },
        {
            name: 'Help Desk Officer',
            phoneNumber: '0933333333',
            password: helpDeskPassword,
            role: 'HELP_DESK',
            identificationNumber: 'HD-001',
            nationalId: '3333333333333333'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { phoneNumber: user.phoneNumber },
            update: {
                name: user.name,
                password: user.password,
                role: user.role,
                identificationNumber: user.identificationNumber,
                nationalId: user.nationalId
            },
            create: user
        });
        console.log(`👤 User seeded/updated: ${user.name} (${user.role}) - Phone: ${user.phoneNumber}`);
    }

    console.log("🎉 SEED COMPLETE");
}

main()
    .catch((e) => {
        console.error("❌ SEED ERROR:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });