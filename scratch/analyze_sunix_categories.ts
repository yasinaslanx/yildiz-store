import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    console.log('Categories:');
    for (const c of categories) {
      console.log(`${c.id}\t${c.name}\t${c.slug}`);
    }

    const sunixProducts = await prisma.product.findMany({
      where: { brand: 'Sunix' },
      select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { name: 'asc' },
      take: 1000,
    });

    const withMissingCategory = sunixProducts.filter((p) => !p.categoryId);
    const withOtherCategory = sunixProducts.filter((p) => p.categoryId && p.category?.slug && !['sunix','sunix-urunleri'].includes(p.category.slug));

    console.log('\nSunix products summary:');
    console.log({ total: sunixProducts.length, missingCategory: withMissingCategory.length, otherCategory: withOtherCategory.length });

    console.log('\nSample missing category:');
    console.log(withMissingCategory.slice(0, 20).map((p) => ({ name: p.name, id: p.id })));

    console.log('\nSample non-Sunix category:');
    console.log(withOtherCategory.slice(0, 20).map((p) => ({ name: p.name, category: p.category?.name })));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
