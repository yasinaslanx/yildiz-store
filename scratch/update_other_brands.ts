import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    where: {
      brand: 'Bilinmiyor'
    }
  });

  const updatedCount: Record<string, number> = {
    Hadron: 0,
    Platoon: 0,
    Heartz: 0,
    Blic: 0,
    NNS: 0,
    HalaBilinmiyor: 0
  };

  for (const product of products) {
    const nameUpper = product.name.toUpperCase();
    let newBrand = null;

    if (nameUpper.includes('HADRON') || nameUpper.includes('HADROON')) {
      newBrand = 'Hadron';
    } else if (nameUpper.includes('PLATOON')) {
      newBrand = 'Platoon';
    } else if (nameUpper.includes('HEARTZ')) {
      newBrand = 'Heartz';
    } else if (nameUpper.includes('BLIC') || nameUpper.includes('BLİC')) {
      newBrand = 'Blic';
    } else if (nameUpper.includes('NNS')) {
      newBrand = 'NNS';
    }

    if (newBrand) {
      await prisma.product.update({
        where: { id: product.id },
        data: { brand: newBrand }
      });
      updatedCount[newBrand]++;
    } else {
      updatedCount.HalaBilinmiyor++;
    }
  }

  console.log('Ek Marka Güncelleme Sonuçları:');
  for (const [brand, count] of Object.entries(updatedCount)) {
    console.log(`- ${brand}: ${count}`);
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
