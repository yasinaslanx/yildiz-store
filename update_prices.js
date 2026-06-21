require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const variants = await prisma.productVariant.findMany({
      select: { id: true, price: true, wholesalePrice: true, branchPrice: true, buyPrice: true }
    });

    const exchangeRate = 46.45;
    console.log(`Found ${variants.length} variants. Processing sequentially...`);

    let done = 0;
    for (const v of variants) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          price: v.price ? Number(v.price) * exchangeRate : 0,
          wholesalePrice: v.wholesalePrice ? Number(v.wholesalePrice) * exchangeRate : null,
          branchPrice: v.branchPrice ? Number(v.branchPrice) * exchangeRate : null,
          buyPrice: v.buyPrice ? Number(v.buyPrice) * exchangeRate : null,
        }
      });
      done++;
      if (done % 50 === 0) console.log(`Processed ${done} / ${variants.length}`);
    }

    console.log("Done! All prices updated successfully.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run().catch(console.error);
