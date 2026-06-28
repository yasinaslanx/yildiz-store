import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const targetCategory = await prisma.category.findFirst({
    where: {
      name: { contains: 'kapak', mode: 'insensitive' }
    }
  });

  if (!targetCategory) {
    console.log('Category not found!');
    return;
  }

  const result = await prisma.product.updateMany({
    where: {
      OR: [
        { name: { contains: 'kapak', mode: 'insensitive' } },
        { name: { contains: 'kılıf', mode: 'insensitive' } },
        { name: { contains: 'kilif', mode: 'insensitive' } },
      ],
      categoryId: {
        not: targetCategory.id
      }
    },
    data: {
      categoryId: targetCategory.id
    }
  });

  console.log(`Update complete! ${result.count} products moved to category ${targetCategory.name}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
