import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { limiter } from './middleware/rateLimiter.js';

const app: Express = express();

app.use(limiter);
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
