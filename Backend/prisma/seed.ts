import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Doctors
    const doctor1 = await prisma.doctor.upsert({
        where: { id: 'doctor-1' },
        update: {},
        create: {
            id: 'doctor-1',
            name: 'Dr. Sarah Smith',
            specialty: 'Cardiologist',
        },
    });

    const doctor2 = await prisma.doctor.upsert({
        where: { id: 'doctor-2' },
        update: {},
        create: {
            id: 'doctor-2',
            name: 'Dr. Michael Chen',
            specialty: 'Dermatologist',
        },
    });

    console.log({ doctor1, doctor2 });

    // Create Slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const slot1 = await prisma.slot.create({
        data: {
            time: tomorrow,
            doctorId: doctor1.id,
        },
    });

    tomorrow.setHours(10, 0, 0, 0);
    const slot2 = await prisma.slot.create({
        data: {
            time: tomorrow,
            doctorId: doctor1.id,
        },
    });

    console.log({ slot1, slot2 });
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
