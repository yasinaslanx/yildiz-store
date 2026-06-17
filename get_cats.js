const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log(categories.map(c => c.slug));
}

main().catch(console.error).finally(() => prisma.$disconnect());
