import { Router, Request, Response } from 'express';
import { pool } from '../db/index.js';

export const retreatsRouter = Router();

// GET /api/retreats — list all, filterable by country and/or ayurveda_type
retreatsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { country, ayurveda_type } = req.query;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (typeof country === 'string') {
    values.push(country);
    conditions.push(`country ILIKE $${values.length}`);
  }
  if (typeof ayurveda_type === 'string') {
    values.push(ayurveda_type);
    conditions.push(`ayurveda_type ILIKE $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM retreats ${where} ORDER BY name, price_usd`,
    values
  );
  res.json(result.rows);
});

// GET /api/retreats/:id — single retreat
retreatsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM retreats WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  res.json(result.rows[0]);
});

// GET /api/retreats/:id/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
// Returns all room types for this retreat name with available: boolean per room
retreatsRouter.get('/:id/availability', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { check_in, check_out } = req.query;

  if (typeof check_in !== 'string' || typeof check_out !== 'string') {
    res.status(400).json({ error: 'check_in and check_out query params are required' });
    return;
  }

  if (new Date(check_out) <= new Date(check_in)) {
    res.status(400).json({ error: 'check_out must be after check_in' });
    return;
  }

  // Fetch the retreat to get its name — availability spans all rows with the same name
  const retreatResult = await pool.query('SELECT * FROM retreats WHERE id = $1', [id]);
  if (retreatResult.rows.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  const retreat = retreatResult.rows[0] as { name: string };

  // All room tiers for this property
  const roomsResult = await pool.query(
    `SELECT id, room_type, price_usd, duration_days, ayurveda_type
     FROM retreats
     WHERE name = $1
     ORDER BY price_usd`,
    [retreat.name]
  );

  // Booked room types that overlap the requested window
  const bookedResult = await pool.query(
    `SELECT DISTINCT room_type FROM bookings
     WHERE retreat_id IN (SELECT id FROM retreats WHERE name = $1)
       AND status = 'confirmed'
       AND check_in  < $3
       AND check_out > $2`,
    [retreat.name, check_in, check_out]
  );

  const bookedRoomTypes = new Set(
    (bookedResult.rows as { room_type: string }[]).map((r) => r.room_type)
  );

  const rooms = (
    roomsResult.rows as {
      id: number;
      room_type: string;
      price_usd: string;
      duration_days: number;
      ayurveda_type: string;
    }[]
  ).map((r) => ({
    ...r,
    available: !bookedRoomTypes.has(r.room_type),
  }));

  res.json({
    retreat_id: id,
    retreat_name: retreat.name,
    check_in,
    check_out,
    rooms,
  });
});
