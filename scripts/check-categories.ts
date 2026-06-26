import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const p = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'saat', mode: 'insensitive' } },
        { name: { contains: 'watch', mode: 'insensitive' } },
        { name: { contains: 'akıllı', mode: 'insensitive' } }
      ]
    },
    include: { category: true }
  });
  p.forEach(x => {
     console.log(`${x.name} | Active: ${x.active} | Category: ${x.category?.name || 'NULL'} (slug: ${x.category?.slug || 'NULL'})`);
  });
}

main().finally(() => prisma.$disconnect());
