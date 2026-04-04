import { Request, Response } from 'express';
import { pool } from '../db/index.js';

import { emailService } from '../services/email.service.js';

export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT b.*, r.name AS retreat_name, r.location, r.country
     FROM bookings b
     JOIN retreats r ON r.id = b.retreat_id
     ORDER BY b.id DESC`
  );
  res.json(result.rows);
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const { traveller_name, email, retreat_id, room_type, check_in, check_out } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get retreat info for the email and lock the row
    const retreatResult = await client.query(
      `SELECT name, location, price_usd FROM retreats 
       WHERE id = $1 
       FOR UPDATE`,
      [retreat_id]
    );

    if (retreatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Retreat not found' });
      return;
    }

    const retreat = retreatResult.rows[0];

    // Check for conflicts
    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE retreat_id = $1
         AND room_type  = $2
         AND status     = 'confirmed'
         AND check_in   < $4
         AND check_out  > $3`,
      [retreat_id, room_type, check_in, check_out]
    );

    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Room not available for selected dates' });
      return;
    }

    const result = await client.query(
      `INSERT INTO bookings 
       (traveller_name, email, retreat_id, room_type, check_in, check_out, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
       RETURNING *`,
      [traveller_name, email, retreat_id, room_type, check_in, check_out]
    );

    await client.query('COMMIT');
    
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

    res.status(201).json(result.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};



export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE bookings
     SET status = 'cancelled'
     WHERE id = $1 AND status = 'confirmed'
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Booking not found or already cancelled' });
    return;
  }

  res.json(result.rows[0]);
};
