import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const productsWithoutImages = await prisma.product.findMany({
    where: {
      images: {
        none: {}
      }
    },
    select: {
      brand: true
    }
  });

  const count = productsWithoutImages.length;
  console.log(`Toplam resimsiz ürün sayısı: ${count}`);

  const brandsCount: Record<string, number> = {};
  for (const product of productsWithoutImages) {
    const brand = product.brand || 'Bilinmeyen Marka';
    brandsCount[brand] = (brandsCount[brand] || 0) + 1;
  }

  console.log('\nMarkalara göre dağılım:');
  
  // Sort brands by count descending
  const sortedBrands = Object.entries(brandsCount).sort((a, b) => b[1] - a[1]);
  
  for (const [brand, bCount] of sortedBrands) {
    console.log(`- ${brand}: ${bCount}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
