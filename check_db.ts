import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany();
  console.log('Categories:', cats);
  const prods = await prisma.product.findMany({ include: { category: true } });
  console.log('Products:', prods.map(p => ({name: p.name, cat: p.category?.slug})));
}

main().finally(() => prisma.$disconnect());
