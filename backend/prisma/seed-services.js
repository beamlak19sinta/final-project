const prisma = require('../src/utils/prisma');

async function main() {
    console.log('Seeding core citizen services...');

    const servicesData = [
        {
            sector: 'Vital Statistics',
            description: 'Essential records and identification.',
            services: [
                { name: 'ID Services', description: 'National ID registration and renewal', mode: 'QUEUE', availability: 'Mon-Fri' },
                { name: 'Birth Certificate', description: 'Request birth registration documents', mode: 'APPOINTMENT', availability: 'Mon-Fri' },
            ]
        },
        {
            sector: 'Construction & Urban Development',
            description: 'Building permits and land development.',
            services: [
                { name: 'Construction Permit', description: 'New building and renovation licenses', mode: 'ONLINE', availability: '24/7' },
            ]
        },
        {
            sector: 'Revenue & Finance',
            description: 'Taxation and municipal payments.',
            services: [
                { name: 'Revenue Services', description: 'Property tax and business license payments', mode: 'ONLINE', availability: '24/7' },
            ]
        }
    ];

    for (const data of servicesData) {
        const sector = await prisma.serviceSector.upsert({
            where: { name: data.sector },
            update: { description: data.description },
            create: {
                name: data.sector,
                description: data.description,
            }
        });

        for (const s of data.services) {
            await prisma.service.create({
                data: {
                    ...s,
                    sectorId: sector.id
                }
            });
        }
    }

    console.log('Core services seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
