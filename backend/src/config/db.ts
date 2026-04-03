import { Pool } from 'pg';

const pool: Pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});

export default pool;
