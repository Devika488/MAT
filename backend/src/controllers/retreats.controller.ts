import { Request, Response } from 'express';
import { RetreatsService } from '../services/retreats.service.js';

export const getAllRetreats = async (req: Request, res: Response): Promise<void> => {
  const { country, ayurveda_type } = req.query;
  const result = await RetreatsService.getAllRetreats(
    country as string,
    ayurveda_type as string
  );
  res.json(result);
};

export const getRetreatById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const retreat = await RetreatsService.getRetreatById(id);

  if (!retreat) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  res.json(retreat);
};

export const getRetreatAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { check_in, check_out } = req.query;

  // Date sanity check if provided
  if (check_in && check_out && new Date(check_out as string) <= new Date(check_in as string)) {
    res.status(400).json({ error: 'check_out must be after check_in' });
    return;
  }

  const availability = await RetreatsService.getRetreatAvailability(
    id,
    check_in as string,
    check_out as string
  );

  if (!availability) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  res.json(availability);
};

export const recommendRetreats = async (req: Request, res: Response): Promise<void> => {
  const { goal } = req.query;

  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    res.status(400).json({ error: 'Health goal is required' });
    return;
  }

  try {
    const result = await RetreatsService.recommendRetreats(goal);
    res.json({ goal, recommendations: result });
  } catch (err: any) {
    console.error('Service recommendation error:', err);
    res.status(502).json({ error: 'AI recommendation unavailable' });
  }
};