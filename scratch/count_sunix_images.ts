import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const total = await prisma.product.count({ where: { brand: 'Sunix' } });
    const missing = await prisma.product.count({ where: { brand: 'Sunix', images: { none: {} } } });
    console.log(JSON.stringify({ total, missing, percent: total ? Math.round((missing / total) * 1000) / 10 : 0 }));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
