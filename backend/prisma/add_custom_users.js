const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Adding custom users...');

    const officerPassword = await bcrypt.hash('officer123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    const users = await Promise.all([
        // Create Officer
        prisma.user.upsert({
            where: { phoneNumber: '0900000000' },
            update: {
                password: officerPassword,
                role: 'OFFICER',
                name: 'Custom Officer'
            },
            create: {
                name: 'Custom Officer',
                phoneNumber: '0900000000',
                password: officerPassword,
                role: 'OFFICER',
                identificationNumber: 'OFF-CUSTOM-001'
            }
        }),
        // Create Admin
        prisma.user.upsert({
            where: { phoneNumber: '0911111111' },
            update: {
                password: adminPassword,
                role: 'ADMIN',
                name: 'Custom Admin'
            },
            create: {
                name: 'Custom Admin',
                phoneNumber: '0911111111',
                password: adminPassword,
                role: 'ADMIN',
                identificationNumber: 'ADM-CUSTOM-001'
            }
        })
    ]);

    console.log('Users created/updated successfully:');
    users.forEach(user => {
        console.log(`- ${user.name} (${user.role}): ${user.phoneNumber}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
