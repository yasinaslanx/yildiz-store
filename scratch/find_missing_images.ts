import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find products that have no images
  const productsWithoutImages = await prisma.product.findMany({
    where: {
      images: {
        none: {}
      }
    },
    select: {
      id: true,
      name: true,
      brand: true,
    }
  });

  const count = productsWithoutImages.length;
  console.log(`Total products without images: ${count}`);

  const brandsCount: Record<string, number> = {};
  for (const product of productsWithoutImages) {
    const brand = product.brand || 'Bilinmeyen Marka';
    brandsCount[brand] = (brandsCount[brand] || 0) + 1;
  }

  console.log('\nHangi markalara ait oldukları (ürün sayısı):');
  for (const [brand, bCount] of Object.entries(brandsCount)) {
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
