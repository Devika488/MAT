import fs from 'fs';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    const sqlContent = fs.readFileSync('./init.sql', 'utf8');
    // Using sql.unsafe to run multiple statements from a file
    await sql.unsafe(sqlContent);
    console.log('✅ Production database seeded successfully.');
  } catch (err) {
    console.error('❌ Error seeding production database:', err);
  } finally {
    await sql.end();
  }
}

run();
