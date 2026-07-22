const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = "postgres://postgres.bwcgktteyipwvcnhzszq:Zxcasdqwe.123.Zxc@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?pgbouncer=true&statement_cache_size=0&sslmode=no-verify";

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const email = 'aslanyasin@gmail.com';
  const password = '12345678';
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user exists
  const checkRes = await client.query('SELECT id, email, role FROM "public"."User" WHERE LOWER(email) = LOWER($1)', [email]);
  
  if (checkRes.rows.length > 0) {
    // Update existing user to ADMIN
    await client.query(
      'UPDATE "public"."User" SET "role" = $1, "passwordHash" = $2, "permissions" = $3 WHERE LOWER(email) = LOWER($4)',
      ['ADMIN', passwordHash, ['ORDERS', 'PRODUCTS', 'USERS', 'SUPPORT', 'MARKETING', 'WAREHOUSE'], email]
    );
    console.log(`✓ Existing user ${email} updated to ADMIN with full permissions.`);
  } else {
    // Insert new user
    const id = 'cuid_' + Math.random().toString(36).substring(2, 12);
    await client.query(
      `INSERT INTO "public"."User" (id, "firstName", "lastName", email, "passwordHash", role, permissions, "dealerTier", "creditLimit", "currentDebt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [id, 'Yasin', 'Aslan', email, passwordHash, 'ADMIN', ['ORDERS', 'PRODUCTS', 'USERS', 'SUPPORT', 'MARKETING', 'WAREHOUSE'], 'GOLD', 100000.00, 0.00]
    );
    console.log(`✓ Created new Super Admin user ${email}.`);
  }

  await client.end();
}

main().catch(console.error);
