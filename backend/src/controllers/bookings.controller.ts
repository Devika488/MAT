import { Request, Response } from 'express';
import sql from '../db/index.js';
import { emailService } from '../services/email.service.js';

export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  const result = await sql`
    SELECT b.*, r.name AS retreat_name, r.location, r.country
    FROM bookings b
    JOIN retreats r ON r.id = b.retreat_id
    ORDER BY b.id DESC
  `;
  res.json(result);
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const { traveller_name, email, retreat_id, room_type, check_in, check_out } = req.body;

  try {
    const result = await sql.begin(async (tx) => {
      // Get retreat info for the email and lock the row
      const retreatResult = await tx`
        SELECT name, location, price_usd FROM retreats
        WHERE id = ${retreat_id}
        FOR UPDATE
      `;

      if (retreatResult.length === 0) {
        throw { httpStatus: 404, error: 'Retreat not found' };
      }

      const retreat = retreatResult[0];

      // Check for conflicts
      const conflict = await tx`
        SELECT id FROM bookings
        WHERE retreat_id = ${retreat_id}
          AND room_type  = ${room_type}
          AND status     = 'confirmed'
          AND check_in   < ${check_out}
          AND check_out  > ${check_in}
      `;

      if (conflict.length > 0) {
        throw { httpStatus: 409, error: 'Room not available for selected dates' };
      }

      const insertResult = await tx`
        INSERT INTO bookings
        (traveller_name, email, retreat_id, room_type, check_in, check_out, status)
        VALUES (${traveller_name}, ${email}, ${retreat_id}, ${room_type}, ${check_in}, ${check_out}, 'confirmed')
        RETURNING *
      `;

      // Send background email - don't await to avoid blocking the response
      emailService.sendBookingConfirmation({
        traveller_name,
        email,
        retreat_name: retreat.name,
        location: retreat.location,
        room_type,
        check_in,
        check_out,
        price: retreat.price_usd
      }).catch(err => console.error('Email background error:', err));

      return insertResult[0];
    });

    res.status(201).json(result);

  } catch (err: any) {
    if (err.httpStatus) {
      res.status(err.httpStatus).json({ error: err.error });
      return;
    }
    throw err;
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const result = await sql`
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = ${id} AND status = 'confirmed'
    RETURNING *
  `;

  if (result.length === 0) {
    res.status(404).json({ error: 'Booking not found or already cancelled' });
    return;
  }

  res.json(result[0]);
};
