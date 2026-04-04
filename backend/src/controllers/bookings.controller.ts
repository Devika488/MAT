import { Request, Response } from 'express';
import { BookingsService } from '../services/bookings.service.js';

export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  const result = await BookingsService.getAllBookings();
  res.json(result);
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await BookingsService.createBooking(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.httpStatus) {
      res.status(err.httpStatus).json({ error: err.error });
      return;
    }
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await BookingsService.cancelBooking(id);

  if (!result) {
    res.status(404).json({ error: 'Booking not found or already cancelled' });
    return;
  }

  res.json(result);
};
