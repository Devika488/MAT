import fs from 'fs';
import pg from 'pg';

const connectionString = 'postgresql://postgres:DVgzwItItlNxSvAu@localhost:5432/mat_db';

const pool = new pg.Pool({
  connectionString,
});

async function run() {
  try {
    const sql = fs.readFileSync('./init.sql', 'utf8');
    await pool.query(sql);
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    pool.end();
  }
}

run();
