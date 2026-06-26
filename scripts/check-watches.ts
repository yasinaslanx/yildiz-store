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
    include: { variants: true }
  });
  p.forEach(x => {
     console.log(x.name, '->', x.variants[0]?.price, 'Buy:', x.variants[0]?.buyPrice);
  });
}

main().finally(() => prisma.$disconnect());
