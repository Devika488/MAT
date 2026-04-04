import { Router } from 'express';
import { getAllRetreats, getRetreatById, getRetreatAvailability, recommendRetreats } from '../controllers/retreats.controller.js';

export const retreatsRouter = Router();

// GET /api/retreats — list all, filterable by country and/or ayurveda_type
retreatsRouter.get('/', getAllRetreats);

// GET /api/retreats/:id — single retreat
retreatsRouter.get('/:id', getRetreatById);

// GET /api/retreats/:id/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
retreatsRouter.get('/:id/availability', getRetreatAvailability);
retreatsRouter.get('/recommend', recommendRetreats);
