import { Request, Response } from 'express';
import pool from '../config/db';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
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
    timestamp: new Date().toISOString(),
  });
};
