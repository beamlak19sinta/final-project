/**
 * prisma/seed.js
 * ──────────────────────────────────────────────────────────────────────────────
 * IDEMPOTENT production seed.
 *
 * Rules:
 *  - NEVER deletes existing data.
 *  - Sectors   → upsert by `name`  (name is @unique on ServiceSector)
 *  - Services  → findFirst by (name + sectorId), create only if missing
 *  - Users     → upsert by `nationalId` (nationalId is @unique on User)
 *  - Safe to run multiple times on both local and Render.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ── Sector + Service definitions ──────────────────────────────────────────────
const SECTOR_DATA = [
    {
        name: 'Citizen Services',
        description: 'Core citizen document registration and identity services.',
        icon: 'UserCheck',
        services: [
            { name: 'National ID Registration',  description: 'Register for a new digital national identity card.',         mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'National ID Renewal',        description: 'Renew an expired national digital identity card.',           mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Lost ID Replacement',        description: 'Request replacement for a lost or damaged identity card.',   mode: 'QUEUE',       availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Birth Certificate',          description: 'Apply for and verify birth certificates online.',            mode: 'ONLINE',      availability: '24/7' },
            { name: 'Death Certificate',          description: 'Apply for and verify death certificates online.',            mode: 'ONLINE',      availability: '24/7' },
        ],
    },
    {
        name: 'Transport Services',
        description: 'Driving license and vehicle ownership registry.',
        icon: 'Car',
        services: [
            { name: 'Driving License',       description: 'Queue for renewal or replacement of driver license.',           mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Vehicle Registration',  description: 'Queue for registering vehicle purchase and transfer.',           mode: 'QUEUE',       availability: 'Mon-Fri 08:30-17:00' },
        ],
    },
    {
        name: 'Land Services',
        description: 'Zoning, building permits, property valuation, and transfers.',
        icon: 'Map',
        services: [
            { name: 'Land Title Transfer',   description: 'Submit documents for official land ownership transfer.',         mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Construction Permit',   description: 'Apply for building permits and urban plan review online.',       mode: 'ONLINE',      availability: '24/7' },
            { name: 'Property Valuation',    description: 'Property valuation and land assessment session.',               mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
        ],
    },
    {
        name: 'Revenue Services',
        description: 'Taxes, commercial licensing, and consultations.',
        icon: 'Coins',
        services: [
            { name: 'Tax Clearance',                   description: 'Collect official annual tax clearance statement.',                         mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Business License',                description: 'Apply for new business registrations and commercial licenses online.',     mode: 'ONLINE',      availability: '24/7' },
            { name: 'Revenue Service Appointment',     description: 'Schedule formal consulting with tax and revenue officers.',                mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
        ],
    },
    {
        name: 'Utility Services',
        description: 'Municipal electricity and water infrastructure requests.',
        icon: 'Zap',
        services: [
            { name: 'Electricity Connection',  description: 'Request new power installation connection online.',               mode: 'ONLINE', availability: '24/7' },
            { name: 'Water Connection',        description: 'Request new water infrastructure installation connection online.', mode: 'ONLINE', availability: '24/7' },
        ],
    },
    {
        name: 'Online Help Desk',
        description: 'Inquiries, passport services, and support queues.',
        icon: 'HelpCircle',
        services: [
            { name: 'Queue Services',          description: 'Join the virtual queue for general queries and help desk assistance.',       mode: 'QUEUE',       availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Appointment Services',    description: 'Book a face-to-face consultation with help desk officers.',                mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Passport Application',    description: 'Verify original documents and process new passport applications.',         mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
            { name: 'Passport Renewal',        description: 'Verify and renew passport documents.',                                     mode: 'APPOINTMENT', availability: 'Mon-Fri 08:30-17:00' },
        ],
    },
];

// ── User definitions ──────────────────────────────────────────────────────────
const buildUsers = (adminPw, officerPw, citizenPw, helpDeskPw) => [
    {
        name: 'System Admin',
        phoneNumber: '0911000000',
        password: adminPw,
        role: 'ADMIN',
        identificationNumber: 'ADM-001',
        nationalId: '1111111111111111',
    },
    {
        name: 'Custom Admin',
        phoneNumber: '0911111111',
        password: adminPw,
        role: 'ADMIN',
        identificationNumber: 'ADM-CUSTOM-001',
        nationalId: '1111111111111112',
    },
    {
        name: 'Sample Officer',
        phoneNumber: '0900000000',
        password: officerPw,
        role: 'OFFICER',
        identificationNumber: 'OFF-001',
        nationalId: '2222222222222222',
    },
    {
        name: 'Service Officer',
        phoneNumber: '0922000000',
        password: officerPw,
        role: 'OFFICER',
        identificationNumber: 'OFF-002',
        nationalId: '2222222222222223',
    },
    {
        name: 'Sample Citizen',
        phoneNumber: '0909090909',
        password: citizenPw,
        role: 'CITIZEN',
        identificationNumber: 'CIT-001',
        nationalId: '4444444444444444',
    },
    {
        name: 'Help Desk Officer',
        phoneNumber: '0933333333',
        password: helpDeskPw,
        role: 'HELP_DESK',
        identificationNumber: 'HD-001',
        nationalId: '3333333333333333',
    },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🔥 IDEMPOTENT SEED STARTED — no existing data will be deleted');

    // ── 1. Sectors and Services ───────────────────────────────────────────────
    console.log('\n🌱 Upserting sectors and services...');
    let totalSectors = 0;
    let totalServices = 0;
    let skippedServices = 0;

    for (const s of SECTOR_DATA) {
        // Upsert sector by unique name
        const sector = await prisma.serviceSector.upsert({
            where:  { name: s.name },
            update: { description: s.description, icon: s.icon },
            create: { name: s.name, description: s.description, icon: s.icon },
        });
        totalSectors++;
        console.log(`📂 Sector: ${sector.name} (id: ${sector.id})`);

        for (const svc of s.services) {
            // Service has no unique constraint — check before creating
            const existing = await prisma.service.findFirst({
                where: { name: svc.name, sectorId: sector.id },
            });

            if (existing) {
                // Update description/availability in case they changed
                await prisma.service.update({
                    where: { id: existing.id },
                    data: {
                        description:  svc.description,
                        mode:         svc.mode,
                        availability: svc.availability,
                    },
                });
                console.log(`  ↩  Kept   : ${svc.name} (${svc.mode})`);
                skippedServices++;
            } else {
                await prisma.service.create({
                    data: {
                        name:         svc.name,
                        description:  svc.description,
                        mode:         svc.mode,
                        availability: svc.availability,
                        sectorId:     sector.id,
                    },
                });
                console.log(`  ✅ Created: ${svc.name} (${svc.mode})`);
                totalServices++;
            }
        }
    }

    console.log(`\n   Sectors processed : ${totalSectors}`);
    console.log(`   Services created  : ${totalServices}`);
    console.log(`   Services updated  : ${skippedServices}`);

    // ── 2. Users ──────────────────────────────────────────────────────────────
    console.log('\n👤 Upserting system users...');
    const adminPw     = await bcrypt.hash('admin123',    10);
    const officerPw   = await bcrypt.hash('officer123',  10);
    const citizenPw   = await bcrypt.hash('password123', 10);
    const helpDeskPw  = await bcrypt.hash('1234',        10);

    const users = buildUsers(adminPw, officerPw, citizenPw, helpDeskPw);
    let usersCreated = 0;
    let usersUpdated = 0;

    for (const user of users) {
        const result = await prisma.user.upsert({
            where:  { nationalId: user.nationalId },
            update: {
                name:                 user.name,
                phoneNumber:          user.phoneNumber,
                role:                 user.role,
                identificationNumber: user.identificationNumber,
                // Do NOT overwrite password on update — preserve any manual reset
            },
            create: user,
        });

        const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
        if (isNew) {
            console.log(`  ✅ Created: ${user.name} (${user.role}) — phone: ${user.phoneNumber}`);
            usersCreated++;
        } else {
            console.log(`  ↩  Kept  : ${user.name} (${user.role}) — phone: ${user.phoneNumber}`);
            usersUpdated++;
        }
    }

    console.log(`\n   Users created: ${usersCreated}`);
    console.log(`   Users updated: ${usersUpdated}`);

    // ── 3. Sanity check ───────────────────────────────────────────────────────
    console.log('\n🔍 Sanity check...');
    const sectorCount   = await prisma.serviceSector.count();
    const serviceCount  = await prisma.service.count();
    const userCount     = await prisma.user.count();
    const queueServices = await prisma.service.count({ where: { mode: 'QUEUE' } });
    const apptServices  = await prisma.service.count({ where: { mode: 'APPOINTMENT' } });

    console.log(`   ServiceSectors : ${sectorCount}`);
    console.log(`   Services total : ${serviceCount}  (QUEUE: ${queueServices}, APPOINTMENT: ${apptServices})`);
    console.log(`   Users          : ${userCount}`);

    if (sectorCount === 0 || serviceCount === 0) {
        throw new Error('❌ Seed validation failed: no sectors or services found after seed!');
    }

    console.log('\n🎉 SEED COMPLETE — database is ready for production use');
}

main()
    .catch((e) => {
        console.error('\n❌ SEED ERROR:', e.message);
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });