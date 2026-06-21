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
      select: { id: true, buyPrice: true, price: true, branchPrice: true, wholesalePrice: true }
    });

    console.log(`Veritabanındaki ${variants.length} ürünün fiyatları 'Alış Fiyatı'na eşitleniyor...`);
    let updated = 0;

    for (const v of variants) {
      // Eğer buyPrice (alış fiyatı) varsa onu kullan. Yoksa eldeki herhangi bir fiyatı baz al.
      const basePrice = v.buyPrice || v.price || v.branchPrice || v.wholesalePrice || 0;
      
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          price: basePrice,
          branchPrice: basePrice,
          wholesalePrice: basePrice,
          buyPrice: basePrice
        }
      });
      updated++;
      if (updated % 100 === 0) console.log(`${updated} ürün güncellendi...`);
    }

    console.log(`Tamamlandı! Tüm ürünlerin perakende, toptan ve bayi fiyatları alış fiyatına sabitlendi.`);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
