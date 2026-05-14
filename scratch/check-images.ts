import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const names = ['Anker 737 Power Bank', 'Sony WH-1000XM5', 'ASUS ROG Zephyrus G14'];
  for (const name of names) {
    const p = await prisma.product.findFirst({
      where: { name },
      include: {
        images: true,
        variants: {
          include: {
            images: true
          }
        }
      }
    });
    console.log(`Product: ${name}`);
    console.log(`- Images: ${p?.images.length}`);
    p?.images.forEach(img => console.log(`  - ${img.url}`));
    console.log(`- Variants: ${p?.variants.length}`);
    p?.variants.forEach(v => {
      console.log(`  - Variant ${v.sku} Images: ${v.images.length}`);
      v.images.forEach(img => console.log(`    - ${img.url}`));
    });
  }
}

main().finally(() => prisma.$disconnect());
