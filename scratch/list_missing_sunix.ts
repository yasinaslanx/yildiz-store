import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const missingProducts = await prisma.product.findMany({
    where: {
      brand: 'Sunix',
      images: { none: {} }
    },
    take: 20
  });

  console.log(`Still missing images for:`);
  for (const product of missingProducts) {
    console.log(`- ${product.name}`);
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
