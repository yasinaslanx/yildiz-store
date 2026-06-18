import { prisma } from '../src/lib/prisma';

async function migrateWholesalePrices() {
  console.log("Starting migration: copying price to wholesalePrice for all variants");
  
  const variants = await prisma.productVariant.findMany({
    select: { id: true, price: true }
  });

  console.log(`Found ${variants.length} variants. Updating...`);

  const chunkSize = 50;
  for (let i = 0; i < variants.length; i += chunkSize) {
    const chunk = variants.slice(i, i + chunkSize);
    
    for (const v of chunk) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { wholesalePrice: v.price }
      });
    }
    console.log(`Updated ${Math.min(i + chunkSize, variants.length)} / ${variants.length}`);
  }

  console.log("Migration completed successfully!");
}

migrateWholesalePrices()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
