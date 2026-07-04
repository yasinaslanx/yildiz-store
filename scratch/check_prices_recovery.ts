import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sample = await prisma.productVariant.findFirst({
    where: { price: 0 }
  });

  console.log("Sample variant:", sample);

  // Check how many have price 0 vs price > 0
  const zeroPrice = await prisma.productVariant.count({ where: { price: 0 } });
  const nonZeroPrice = await prisma.productVariant.count({ where: { price: { gt: 0 } } });

  console.log(`Variants with price 0: ${zeroPrice}`);
  console.log(`Variants with price > 0: ${nonZeroPrice}`);
  
  // Check if we can recover from another field
  const retailZero = await prisma.productVariant.count({ where: { retailPrice: 0 } });
  const retailNonZero = await prisma.productVariant.count({ where: { retailPrice: { gt: 0 } } });
  console.log(`Variants with retailPrice 0: ${retailZero}, > 0: ${retailNonZero}`);

  const wholesaleNonZero = await prisma.productVariant.count({ where: { wholesalePrice: { gt: 0 } } });
  console.log(`Variants with wholesalePrice > 0: ${wholesaleNonZero}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
