import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const productsWithoutImages = await prisma.product.findMany({
    where: {
      images: {
        none: {}
      }
    }
  });

  console.log("NO_IMAGE_PRODUCTS_COUNT:", productsWithoutImages.length);
  if (productsWithoutImages.length > 0) {
    console.log("Sample:", productsWithoutImages[0].name);
    // Add placeholders to them
    for (const prod of productsWithoutImages) {
        // Find variant
        const variant = await prisma.productVariant.findFirst({ where: { productId: prod.id } });
        if (variant) {
            await prisma.productImage.create({
                data: {
                    productId: prod.id,
                    variantId: variant.id,
                    url: "https://placehold.co/600x600/f5f5f4/a8a29e?text=" + encodeURIComponent(prod.name),
                    order: 0
                }
            });
            console.log(`Added image for ${prod.name}`);
        }
    }
  }

  const badImages2 = await prisma.productImage.findMany({
    where: {
       OR: [
           { url: { startsWith: '/' } },
           { url: { startsWith: 'data:image' } },
           { url: { equals: '' } }
       ]
    }
  });
  console.log("BAD_URLS_COUNT:", badImages2.length);

}

main().finally(() => prisma.$disconnect());
