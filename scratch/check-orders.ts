import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.order.count();
  const orders = await prisma.order.findMany({
    take: 5,
    include: { items: true }
  });
  
  console.log(`Total orders: ${count}`);
  console.log(JSON.stringify(orders, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
