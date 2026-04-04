import 'dotenv/config';
import app from './app.js';

const port: number = parseInt(process.env.PORT || '3001', 10);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
