const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding specific credentials for testing...');
    
    // Clear existing referencing tables to avoid foreign key violations, then clear users
    await prisma.systemLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.queue.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.serviceRequest.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.helpDeskQuestion.deleteMany({});
    await prisma.user.deleteMany({});

    const adminHash = await bcrypt.hash('admin123', 10);
    const officerHash = await bcrypt.hash('officer123', 10);
    const citizenHash = await bcrypt.hash('password123', 10);
    const helpDeskHash = await bcrypt.hash('1234', 10);

    const users = [
        {
            name: 'System Admin',
            phoneNumber: '0911111111',
            password: adminHash,
            role: 'ADMIN',
            identificationNumber: 'ADM-001',
            nationalId: '1111111111111111'
        },
        {
            name: 'Sample Officer',
            phoneNumber: '0900000000',
            password: officerHash,
            role: 'OFFICER',
            identificationNumber: 'OFF-001',
            nationalId: '2222222222222222'
        },
        {
            name: 'Sample Citizen',
            phoneNumber: '0909090909',
            password: citizenHash,
            role: 'CITIZEN',
            identificationNumber: 'CIT-001',
            nationalId: '4444444444444444'
        },
        {
            name: 'Help Desk Officer',
            phoneNumber: '0933333333',
            password: helpDeskHash,
            role: 'HELP_DESK',
            identificationNumber: 'HD-001',
            nationalId: '3333333333333333'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { phoneNumber: user.phoneNumber },
            update: {
                password: user.password,
                role: user.role,
                name: user.name
            },
            create: user
        });
        console.log(`User seeded/updated: ${user.name} (${user.role}) - ${user.phoneNumber} / ${user.role.toLowerCase()}123 (or password123 for citizen)`);
    }

    console.log('Credentials seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
