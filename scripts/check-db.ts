import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      images: true,
    },
  });
  const users = await prisma.user.findMany();

  console.log("Kategoriler:", categories.length);
  console.log("Ürünler:", products.length);
  console.log("Kullanıcılar:", users.length);
  console.dir(products, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });