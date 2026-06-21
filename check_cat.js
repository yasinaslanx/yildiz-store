const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  console.log(categories);
}

main().finally(() => prisma.$disconnect());
