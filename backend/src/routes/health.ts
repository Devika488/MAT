import { Router } from 'express';
import sql from '../db/index.js';

const router: Router = Router();

router.get('/', async (_req, res) => {
  let dbStatus: string = 'disconnected';
  try {
    await sql`SELECT 1`;
    dbStatus = 'connected';
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
