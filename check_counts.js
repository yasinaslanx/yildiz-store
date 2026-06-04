const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count();
  console.log(`Total products: ${count}`);
  const activeCount = await prisma.product.count({ where: { active: true } });
  console.log(`Active products: ${activeCount}`);
  const withVariants = await prisma.product.count({ where: { variants: { some: {} } } });
  console.log(`Products with at least one variant: ${withVariants}`);
  
  const categories = await prisma.category.findMany();
  console.log(`Categories:`, categories.map(c => c.name).join(', '));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
