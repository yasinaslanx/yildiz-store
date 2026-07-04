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
      brand: 'Bilinmiyor',
      NOT: [
        { name: { contains: 'SUNİX', mode: 'insensitive' } },
        { name: { contains: 'SUNIX', mode: 'insensitive' } }
      ]
    },
    include: {
      variants: true
    },
    take: 20
  });

  for (const product of products) {
    const sku = product.variants[0]?.sku || 'No SKU';
    console.log(`ID: ${product.id} | Name: ${product.name} | SKU: ${sku}`);
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
