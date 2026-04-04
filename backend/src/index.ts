import 'dotenv/config';
import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { errorHandler } from './middleware/errorHandler.js';

import { limiter } from './middleware/rateLimiter.js';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3001', 10);

app.use(limiter);
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
