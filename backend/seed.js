const prisma = require('./src/utils/prisma'); // ./src/utils/prisma.js
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding database...');

    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { phoneNumber: '0911111111' },
        update: {},
        create: {
            id: '1',
            name: 'System Admin',
            phoneNumber: '0911111111',
            password: adminPassword,
            role: 'ADMIN',
            identificationNumber: 'ADM-001',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    // Officer user
    const officerPassword = await bcrypt.hash('officer123', 10);
    await prisma.user.upsert({
        where: { phoneNumber: '0922000000' },
        update: {},
        create: {
            id: '2',
            name: 'Service Officer',
            phoneNumber: '0922000000',
            password: officerPassword,
            role: 'OFFICER',
            identificationNumber: 'OFF-001',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    // Citizen user
    const citizenPassword = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
        where: { phoneNumber: '0909090909' },
        update: {},
        create: {
            id: '3',
            name: 'Sample Citizen',
            phoneNumber: '0909090909',
            password: citizenPassword,
            role: 'CITIZEN',
            identificationNumber: 'CIT-001',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });