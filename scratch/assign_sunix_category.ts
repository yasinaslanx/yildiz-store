import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const category = await prisma.category.upsert({
      where: { slug: 'sunix' },
      create: { name: 'Sunix', slug: 'sunix', description: 'Sunix markalı ürünler' },
      update: { name: 'Sunix', description: 'Sunix markalı ürünler' },
    });

    const result = await prisma.product.updateMany({
      where: { brand: 'Sunix' },
      data: { categoryId: category.id },
    });

    console.log(JSON.stringify({
      categoryId: category.id,
      categoryName: category.name,
      updatedProductCount: result.count,
    }));

    const sunixProducts = await prisma.product.findMany({
      where: { brand: 'Sunix' },
      select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } },
      take: 10,
    });

    console.log('Sample updated products:');
    console.log(JSON.stringify(sunixProducts, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
