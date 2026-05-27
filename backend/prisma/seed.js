const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log("🔥 PRODUCTION SEED STARTED");

    // 1. Clean out existing transactional data first to prevent foreign key violations
    console.log("🧹 Clearing existing transaction data & users to avoid conflicts...");
    await prisma.systemLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.queue.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.serviceRequest.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.helpDeskQuestion.deleteMany({});
    await prisma.feedback.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.serviceSector.deleteMany({});

    // 2. Define the exact 6 sectors and their corresponding 19 services requested
    const sectorData = [
        {
            name: 'Citizen Services',
            description: 'Core citizen document registration and identity services.',
            icon: 'UserCheck',
            services: [
                { name: 'National ID Registration', description: 'Register for a new digital national identity card.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'National ID Renewal', description: 'Renew an expired national digital identity card.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Lost ID Replacement', description: 'Request replacement for a lost or damaged identity card.', mode: 'QUEUE', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Birth Certificate', description: 'Apply for and verify birth certificates online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Death Certificate', description: 'Apply for and verify death certificates online.', mode: 'ONLINE', availability: '24/7' }
            ]
        },
        {
            name: 'Transport Services',
            description: 'Driving license and vehicle ownership registry.',
            icon: 'Car',
            services: [
                { name: 'Driving License', description: 'Queue for renewal or replacement of driver license.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Vehicle Registration', description: 'Queue for registering vehicle purchase and transfer.', mode: 'QUEUE', availability: 'Mon-Fri 08:30-17:00' }
            ]
        },
        {
            name: 'Land Services',
            description: 'Zoning, building permits, property valuation, and transfers.',
            icon: 'Map',
            services: [
                { name: 'Land Title Transfer', description: 'Submit documents for official land ownership transfer.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Construction Permit', description: 'Apply for building permits and urban plan review online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Property Valuation', description: 'Property valuation and land assessment session.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' }
            ]
        },
        {
            name: 'Revenue Services',
            description: 'Taxes, commercial licensing, and consultations.',
            icon: 'Coins',
            services: [
                { name: 'Tax Clearance', description: 'Collect official annual tax clearance statement.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Business License', description: 'Apply for new business registrations and commercial licenses online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Revenue Service Appointment', description: 'Schedule formal consulting with tax and revenue officers.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' }
            ]
        },
        {
            name: 'Utility Services',
            description: 'Municipal electricity and water infrastructure requests.',
            icon: 'Zap',
            services: [
                { name: 'Electricity Connection', description: 'Request new power installation connection online.', mode: 'ONLINE', availability: '24/7' },
                { name: 'Water Connection', description: 'Request new water infrastructure installation connection online.', mode: 'ONLINE', availability: '24/7' }
            ]
        },
        {
            name: 'Online Help Desk',
            description: 'Inquiries, passport services, and support queues.',
            icon: 'HelpCircle',
            services: [
                { name: 'Queue Services', description: 'Join the virtual queue for general queries and help desk assistance.', mode: 'QUEUE', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Appointment Services', description: 'Book a face-to-face consultation with help desk officers.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Passport Application', description: 'Verify original documents and process new passport applications.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
                { name: 'Passport Renewal', description: 'Verify and renew passport documents.', mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' }
            ]
        }
    ];

    // Seed sectors and services
    console.log("🌱 Seeding 6 service sectors and 19 government services...");
    for (const s of sectorData) {
        const sector = await prisma.serviceSector.create({
            data: {
                name: s.name,
                description: s.description,
                icon: s.icon
            }
        });
        console.log(`📂 Created Sector: ${sector.name}`);

        for (const svc of s.services) {
            const service = await prisma.service.create({
                data: {
                    name: svc.name,
                    description: svc.description,
                    mode: svc.mode,
                    availability: svc.availability,
                    sectorId: sector.id
                }
            });
            console.log(`  └─ 🛠️ Created Service: ${service.name} (${service.mode})`);
        }
    }

    // 3. Seed users with safe, pre-hashed passwords
    console.log("👤 Seeding system users (Admin, Officer, Helpdesk, Citizen)...");
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
        await prisma.user.create({
            data: user
        });
        console.log(`👤 Seeded User: ${user.name} (${user.role}) - Phone: ${user.phoneNumber}`);
    }

    console.log("🎉 PRODUCTION SEED COMPLETE");
}

main()
    .catch((e) => {
        console.error("❌ SEED ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });