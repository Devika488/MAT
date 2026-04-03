import { Router } from 'express';
import { pool } from '../db/index.js';

const router: Router = Router();

router.get('/', async (_req, res) => {
  let dbStatus: string = 'disconnected';
  try {
    const client = await pool.connect();
    dbStatus = 'connected';
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
