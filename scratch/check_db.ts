import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const newProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { variants: true, images: true }
  });
  console.log("Newly added products:");
  console.log(JSON.stringify(newProducts, null, 2));

  const someUpdated = await prisma.productVariant.findMany({
    where: { price: { not: 500 } },
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: { product: true }
  });
  console.log("Some updated products (price != 500):");
  console.log(JSON.stringify(someUpdated, null, 2));
}

main().finally(() => prisma.$disconnect());
