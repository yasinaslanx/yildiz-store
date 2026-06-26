import { prisma } from '../src/lib/prisma';

async function main() {
  const p = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'saat' } },
        { name: { contains: 'watch' } },
        { name: { contains: 'akıllı' } }
      ]
    },
    include: { variants: true }
  });
  console.log(JSON.stringify(p, null, 2));
}

main().finally(() => prisma.$disconnect());
