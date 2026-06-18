import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const mg20 = await prisma.productVariant.findFirst({
    where: { product: { name: { contains: 'MG-20' } } }
  });
  console.log('MG-20 Variant:', mg20);
}

main().finally(() => prisma.$disconnect());
