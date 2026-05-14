import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  }),
});

async function main() {
  const products = await prisma.product.updateMany({
    data: { active: true },
  });
  const variants = await prisma.productVariant.updateMany({
    data: { active: true },
  });
  console.log(`Updated ${products.count} products and ${variants.count} variants to active.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
