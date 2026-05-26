const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('Seeding database...');

    // Create sectors and canonical service lists shared by web + mobile.
    const sectorData = [
        {
            name: 'Civil Records',
            description: 'Core records and identity services.',
            icon: 'Building2',
            services: [
                { name: 'Birth Certificate', description: 'Request and process official birth certificates.', mode: 'APPOINTMENT', availability: 'Mon-Fri', icon: 'FileBadge' },
                { name: 'Marriage Certificate', description: 'Apply for and verify marriage certificate documents.', mode: 'APPOINTMENT', availability: 'Mon-Fri', icon: 'HeartHandshake' },
                { name: 'ID Renewal', description: 'Renew national identity documents with office verification.', mode: 'APPOINTMENT', availability: 'Mon-Fri', icon: 'IdCard' },
                { name: 'Digital ID', description: 'Manage digital ID issuance and renewal support.', mode: 'ONLINE', availability: '24/7', icon: 'ShieldCheck' },
            ]
        },
        {
            name: 'Operations',
            description: 'Queue, appointments, revenue, and land operations.',
            icon: 'BriefcaseBusiness',
            services: [
                { name: 'Queue Services', description: 'Take queue tickets and monitor live queue position.', mode: 'QUEUE', availability: 'Mon-Fri', icon: 'Ticket' },
                { name: 'Revenue Services', description: 'Handle municipal revenue, tax, and payment-related services.', mode: 'ONLINE', availability: '24/7', icon: 'Landmark' },
                { name: 'Land Title Services', description: 'Submit and track land title and transfer processes.', mode: 'ONLINE', availability: '24/7', icon: 'MapPinned' },
                { name: 'Appointment Booking', description: 'Book service appointments across available departments.', mode: 'APPOINTMENT', availability: 'Mon-Fri', icon: 'CalendarDays' }
            ]
        }
    ];

    for (const s of sectorData) {
        const sector = await prisma.serviceSector.upsert({
            where: { name: s.name },
            update: {
                description: s.description,
                icon: s.icon,
            },
            create: {
                name: s.name,
                description: s.description,
                icon: s.icon,
            }
        });

        for (const svc of s.services) {
            const serviceId = `${sector.id}-${svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
            await prisma.service.upsert({
                where: { id: serviceId },
                update: {
                    name: svc.name,
                    description: svc.description,
                    mode: svc.mode,
                    availability: svc.availability,
                    icon: svc.icon,
                    sectorId: sector.id
                },
                create: {
                    id: serviceId,
                    name: svc.name,
                    description: svc.description,
                    mode: svc.mode,
                    availability: svc.availability,
                    icon: svc.icon,
                    sectorId: sector.id
                }
            });
        }
    }

    // Create Admin and Officer
    const adminPassword = await bcrypt.hash('admin123', 10);
    const officerPassword = await bcrypt.hash('officer123', 10);

    const users = await Promise.all([
        prisma.user.upsert({
            where: { phoneNumber: '0911000000' },
            update: {},
            create: {
                name: 'System Admin',
                phoneNumber: '0911000000',
                password: adminPassword,
                role: 'ADMIN',
                identificationNumber: 'ADM-001',
                nationalId: '1111111111111111'
            }
        }),
        prisma.user.upsert({
            where: { phoneNumber: '0922000000' },
            update: {},
            create: {
                name: 'Service Officer',
                phoneNumber: '0922000000',
                password: officerPassword,
                role: 'OFFICER',
                identificationNumber: 'OFF-001',
                nationalId: '2222222222222222'
            }
        }),
        prisma.user.upsert({
            where: { phoneNumber: '0933333331' },
            update: {},
            create: {
                name: 'Help Desk Officer',
                
                phoneNumber: '0933333331',
                password:'123help',
                role: 'HELP_DESK',
                identificationNumber: 'HD-001',
                nationalId: '3333333333333333'
            }
        }),
    ]);

    console.log('Seeding completed:', sectorData.length, 'sectors and', users.length, 'users created');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
