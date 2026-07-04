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

  const updatedCount = {
    Sunix: 0,
    Deluxse: 0,
    Vizyon: 0,
    HalaBilinmiyor: 0
  };

  for (const product of products) {
    // Replace Turkish 'İ' with 'I' and then toUpperCase just to be safe,
    // or just check against both variations.
    const nameUpper = product.name.toUpperCase();
    let newBrand = null;

    if (nameUpper.includes('SUNİX') || nameUpper.includes('SUNIX') || nameUpper.includes('SNX')) {
      newBrand = 'Sunix';
    } else if (nameUpper.includes('DELUXSE') || nameUpper.includes('DELUXE') || nameUpper.includes('DLX')) {
      newBrand = 'Deluxse';
    } else if (nameUpper.includes('VİZYON') || nameUpper.includes('VIZYON') || nameUpper.includes('VZY')) {
      newBrand = 'Vizyon';
    }

    if (newBrand) {
      await prisma.product.update({
        where: { id: product.id },
        data: { brand: newBrand }
      });
      updatedCount[newBrand as keyof typeof updatedCount]++;
    } else {
      updatedCount.HalaBilinmiyor++;
    }
  }

  console.log('Güncelleme Sonuçları:');
  console.log(`- Sunix olarak güncellenen: ${updatedCount.Sunix}`);
  console.log(`- Deluxse olarak güncellenen: ${updatedCount.Deluxse}`);
  console.log(`- Vizyon olarak güncellenen: ${updatedCount.Vizyon}`);
  console.log(`- Hala markası tespit edilemeyen: ${updatedCount.HalaBilinmiyor}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
