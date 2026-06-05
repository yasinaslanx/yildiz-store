import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const images = await prisma.productImage.findMany({
    take: 15,
  });
  console.log(images.map(img => img.url));
}

main().finally(() => prisma.$disconnect());
