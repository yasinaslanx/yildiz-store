import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  // Find the Akıllı Saat category
  const watchCategory = await prisma.category.findFirst({
    where: { slug: 'akilli-saat' }
  });

  if (!watchCategory) {
    console.log("Akıllı Saat kategorisi bulunamadı!");
    return;
  }

  // Get all watches that are NOT in this category
  const watchesToUpdate = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'saat', mode: 'insensitive' } },
        { name: { contains: 'watch', mode: 'insensitive' } },
        { name: { contains: 'akıllı', mode: 'insensitive' } }
      ],
      NOT: [
        { name: { contains: 'şarj', mode: 'insensitive' } },
        { name: { contains: 'şarz', mode: 'insensitive' } },
        { name: { contains: 'kordon', mode: 'insensitive' } },
        { name: { contains: 'ekran koruyucu', mode: 'insensitive' } },
        { name: { contains: 'takip cihazı', mode: 'insensitive' } }
      ],
      categoryId: { not: watchCategory.id }
    }
  });

  let updatedCount = 0;
  for (const w of watchesToUpdate) {
    await prisma.product.update({
      where: { id: w.id },
      data: { categoryId: watchCategory.id }
    });
    console.log(`Moved to Akıllı Saat: ${w.name}`);
    updatedCount++;
  }

  console.log(`Updated ${updatedCount} products to 'Akıllı Saat' category.`);
}

main().finally(() => prisma.$disconnect());
