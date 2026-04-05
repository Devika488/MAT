import { Request, Response } from 'express';
import { BookingsService } from '../services/bookings.service.js';

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  const { retreat_id, status, page, limit } = req.query;
  
  const result = await BookingsService.getAllBookings({
    retreat_id: retreat_id ? parseInt(retreat_id as string) : undefined,
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined
  });
  
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
