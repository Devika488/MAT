import 'dotenv/config';
import express, { Express } from 'express';
import routes from './routes/routes';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3001', 10);

app.use(express.json());

// Routes
app.use('/', routes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
