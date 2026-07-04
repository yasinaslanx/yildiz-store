import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const brandCounts = await prisma.product.groupBy({
    by: ['brand'],
    _count: {
      brand: true
    }
  });

  for (const count of brandCounts) {
    if (['Sunix', 'Deluxse', 'Vizyon', 'Bilinmiyor'].includes(count.brand)) {
      console.log(`- ${count.brand}: ${count._count.brand}`);
    }
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
