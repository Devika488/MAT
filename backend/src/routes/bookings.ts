import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { createBookingSchema } from '../schemas/booking.schema.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { getAllBookings, createBooking, cancelBooking } from '../controllers/bookings.controller.js';

export const bookingsRouter = Router();

// GET /api/bookings — list all bookings with retreat name joined
bookingsRouter.get('/', getAllBookings);

// POST /api/bookings — create booking with conflict check inside a transaction
bookingsRouter.post(
  '/',
  bookingLimiter,
  validate(createBookingSchema),
  createBooking
);

// DELETE /api/bookings/:id — soft cancel
bookingsRouter.delete('/:id', cancelBooking);
