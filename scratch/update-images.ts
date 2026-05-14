import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const updates = [
    { name: 'Anker 737 Power Bank', url: '/images/products/anker-737.png' },
    { name: 'Sony WH-1000XM5', url: '/images/products/sony-xm5.png' },
    { name: 'ASUS ROG Zephyrus G14', url: '/images/products/asus-rog.png' }
  ];

  for (const item of updates) {
    const product = await prisma.product.findFirst({
      where: { name: item.name },
      include: { variants: true }
    });

    if (product) {
      // Ana görseli güncelle
      await prisma.productImage.updateMany({
        where: { productId: product.id },
        data: { url: item.url }
      });

      // Varyant görsellerini güncelle
      for (const variant of product.variants) {
        await prisma.productImage.updateMany({
          where: { variantId: variant.id },
          data: { url: item.url }
        });
      }
      console.log(`Güncellendi: ${item.name}`);
    } else {
      console.log(`Bulunamadı: ${item.name}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
