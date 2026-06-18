import { prisma } from '../src/lib/prisma';

async function run() {
  const apps = await prisma.dealerApplication.findMany();
  console.log(JSON.stringify(apps, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
