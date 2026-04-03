import { Router } from 'express';
import healthRouter from './health.js';
import { retreatsRouter } from './retreats.js';
import { bookingsRouter } from './bookings.js';

const router: Router = Router();

// Root Application Route
router.get('/', (req, res) => {
  res.send('App is running');
});

// Mount all application routes here
router.use('/health', healthRouter);
router.use('/retreats', retreatsRouter);
router.use('/bookings', bookingsRouter);

export default router;
