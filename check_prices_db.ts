import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { name: { contains: 'SAAT' } } },
    include: { product: true },
    orderBy: { updatedAt: 'desc' }
  });
  console.log(variants.map(v => ({ sku: v.sku, name: v.product.name, price: v.price })));
}

main().finally(() => process.exit(0));
