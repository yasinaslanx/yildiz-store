import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const old = await prisma.productVariant.findMany({
    where: { updatedAt: { lt: new Date('2026-06-18T00:00:00Z') } },
    take: 5
  });
  console.log('Old products:', old);
}
main().finally(() => prisma.$disconnect());
