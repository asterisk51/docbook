import { Router } from 'express';
import { bookSlot } from '../controllers/bookingController';

const router = Router();

router.post('/bookings', bookSlot);

export default router;
