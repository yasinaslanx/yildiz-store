import { prisma } from './src/lib/prisma';
async function main() {
  const categories = await prisma.category.findMany({
    select: { name: true, slug: true },
  });
  console.log(categories);
}
main().finally(() => prisma.$disconnect());
