import { Router } from 'express';
import healthRouter from './health';

const router: Router = Router();

// Root Application Route
router.get('/', (req, res) => {
  res.send('App is running');
});

// Mount all application routes here
router.use('/health', healthRouter);

export default router;
