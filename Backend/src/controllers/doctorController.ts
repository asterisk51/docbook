import { Request, Response } from 'express';
import prisma from '../utils/prismaClient';
import { z } from 'zod';

const doctorSchema = z.object({
    name: z.string(),
    specialty: z.string().optional(),
});

const slotSchema = z.object({
    time: z.string().datetime(), // ISO string
    doctorId: z.string(),
});

export const createDoctor = async (req: Request, res: Response) => {
    try {
        console.log('Received create doctor request:', req.body);
        const data = doctorSchema.parse(req.body);
        const doctor = await prisma.doctor.create({ data });
        res.json(doctor);
    } catch (error) {
        console.error('Validation error:', error);
        res.status(400).json({ error: 'Invalid input', details: error });
    }
};

export const getDoctors = async (req: Request, res: Response) => {
    const doctors = await prisma.doctor.findMany({ include: { slots: true } });
    res.json(doctors);
};

export const createSlot = async (req: Request, res: Response) => {
    try {
        const data = slotSchema.parse(req.body);
        const slot = await prisma.slot.create({
            data: {
                time: data.time,
                doctorId: data.doctorId,
            },
        });
        res.json(slot);
    } catch (error) {
        res.status(400).json({ error: 'Invalid input or Doctor not found' });
    }
};

export const getSlots = async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const slots = await prisma.slot.findMany({
        where: { doctorId },
        orderBy: { time: 'asc' },
    });
    res.json(slots);
};
