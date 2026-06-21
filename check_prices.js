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
      select: { sku: true, price: true, wholesalePrice: true, branchPrice: true, buyPrice: true }
    });

    let missingCount = 0;
    let suspiciouslyLowCount = 0;

    for (const v of variants) {
      // Sadece 0 veya null olanlar (Eğer hepsi 0/null ise sorun vardır)
      if (!Number(v.price) && !Number(v.buyPrice) && !Number(v.wholesalePrice)) {
        missingCount++;
      } 
      // 5 TL'den düşük fiyat varsa büyük ihtimalle çarpılmamıştır (0.77 dolar kalmıştır)
      else if (Number(v.price) > 0 && Number(v.price) < 5) {
        suspiciouslyLowCount++;
      }
    }

    console.log(`---------------------------------`);
    console.log(`[RAPOR] Toplam Varyant Sayısı: ${variants.length}`);
    console.log(`[RAPOR] Fiyatı Tamamen Boş Olanlar: ${missingCount}`);
    console.log(`[RAPOR] Dolar Çevrilmemiş (Çok düşük) Görünenler: ${suspiciouslyLowCount}`);
    console.log(`---------------------------------`);
    
    // Rastgele 3 ürün göster
    console.log('Örnek Güncellenmiş Ürünler:');
    for(let i=0; i<3; i++) {
        console.log(variants[Math.floor(Math.random() * variants.length)]);
    }

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run().catch(console.error);
