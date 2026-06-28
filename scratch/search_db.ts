import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: {
      OR: [
        { sku: { contains: '4483' } },
        { product: { name: { contains: 'FN-12' } } },
        { product: { name: { contains: 'FAN' } } },
        { sku: { contains: 'FN' } }
      ]
    },
    include: { product: true }
  });
  
  console.log("Found variants:", variants.map(v => ({ sku: v.sku, name: v.product.name })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
