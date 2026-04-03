import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { validate } from '../middleware/validate.js';

export const bookingsRouter = Router();

const BookingSchema = z
  .object({
    traveller_name: z.string().min(2).max(100),
    email: z.string().email(),
    retreat_id: z.number().int().positive(),
    room_type: z.string().min(1),
    check_in: z.string().date(),
    check_out: z.string().date(),
  })
  .refine((d) => new Date(d.check_out) > new Date(d.check_in), {
    message: 'check_out must be after check_in',
    path: ['check_out'],
  });

type BookingBody = z.infer<typeof BookingSchema>;

// GET /api/bookings — list all bookings with retreat name joined
bookingsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  const result = await pool.query(
    `SELECT b.*, r.name AS retreat_name, r.location, r.country
     FROM bookings b
     JOIN retreats r ON r.id = b.retreat_id
     ORDER BY b.id DESC`
  );
  res.json(result.rows);
});

// POST /api/bookings — create booking with conflict check inside a transaction
bookingsRouter.post(
  '/',
  validate(BookingSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { traveller_name, email, retreat_id, room_type, check_in, check_out } =
      req.body as BookingBody;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lock conflicting rows so concurrent requests cannot double-book
      const conflict = await client.query(
        `SELECT id FROM bookings
         WHERE retreat_id = $1
           AND room_type  = $2
           AND status     = 'confirmed'
           AND check_in   < $4
           AND check_out  > $3
         FOR UPDATE`,
        [retreat_id, room_type, check_in, check_out]
      );

      if (conflict.rows.length > 0) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Room not available for selected dates' });
        return;
      }

      const result = await client.query(
        `INSERT INTO bookings (traveller_name, email, retreat_id, room_type, check_in, check_out, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
         RETURNING *`,
        [traveller_name, email, retreat_id, room_type, check_in, check_out]
      );

      await client.query('COMMIT');
      res.status(201).json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
);

// DELETE /api/bookings/:id — soft cancel
bookingsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
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
});
