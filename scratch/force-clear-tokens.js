const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await pool.query('DELETE FROM "PasswordResetToken"');
    console.log('PasswordResetToken table cleared successfully.');
  } catch (err) {
    console.error('Error clearing table:', err);
  } finally {
    await pool.end();
  }
}

main();
