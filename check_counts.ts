require('dotenv').config();
import { prisma } from "./src/lib/prisma";

async function main() {
  const count = await prisma.product.count();
  console.log(`Total products: ${count}`);
  const activeCount = await prisma.product.count({ where: { active: true } });
  console.log(`Active products: ${activeCount}`);
  
  const latestProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Latest products:", latestProducts.map(p => p.name));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
