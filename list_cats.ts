import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany();
  console.log(cats.map(c => `${c.name} -> ${c.slug}`).join('\n'));
}

main().finally(() => prisma.$disconnect());
