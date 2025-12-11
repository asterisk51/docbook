import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';

import { z } from 'zod';

const bookingSchema = z.object({
    userId: z.string(),
    slotId: z.string(),
});

export const bookSlot = async (req: Request, res: Response) => {
    try {
        const { userId, slotId } = bookingSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Lock the slot row
            // We use raw query for SELECT FOR UPDATE to ensure pessimistic locking
            const slots = await tx.$queryRaw`SELECT * FROM "Slot" WHERE id = ${slotId} FOR UPDATE`;

            const slotList = slots as any[];
            if (slotList.length === 0) {
                throw new Error('Slot not found');
            }

            const slot = slotList[0];

            // 2. Check if already booked
            if (slot.isBooked) {
                throw new Error('Slot is already booked');
            }

            // 3. Mark as booked and create booking
            await tx.slot.update({
                where: { id: slotId },
                data: { isBooked: true },
            });

            const booking = await tx.booking.create({
                data: {
                    userId,
                    slotId,
                    status: 'CONFIRMED',
                },
            });

            return booking;
        });

        res.json({ status: 'CONFIRMED', booking: result });
    } catch (error: any) {
        console.error('Booking failed:', error);
        if (error.message === 'Slot is already booked') {
            res.status(409).json({ status: 'FAILED', message: 'Slot already booked' });
        } else {
            res.status(500).json({ status: 'FAILED', message: 'Internal Server Error' });
        }
    }
};
