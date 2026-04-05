import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV === 'test') {
  console.log('Testing with DATABASE_URL:', connectionString.replace(/:[^:@]+@/, ':***@'));
}
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const sql = postgres(connectionString, {
  ssl: isLocal ? false : { rejectUnauthorized: false },
  prepare: false,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
});

if (process.env.NODE_ENV === 'test') {
  console.log('Postgres connection pool initialized for tests.');
}

export default sql;