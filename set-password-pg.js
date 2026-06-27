const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = "postgres://postgres.bwcgktteyipwvcnhzszq:Zxcasdqwe.123.Zxc@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?pgbouncer=true&statement_cache_size=0&sslmode=no-verify";

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const email = 'aslanyasin320@gmail.com';
  const password = '12345678';
  const passwordHash = await bcrypt.hash(password, 10);

  const res = await client.query('UPDATE "public"."User" SET "passwordHash" = $1 WHERE email = $2', [passwordHash, email]);
  
  if (res.rowCount > 0) {
    console.log(`Successfully updated password for ${email}`);
  } else {
    console.log(`User ${email} not found.`);
  }

  await client.end();
}

main().catch(console.error);
