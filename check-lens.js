const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
require("dotenv/config");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const p = await prisma.product.findUnique({
    where: { slug: "sunproof-lens-3739" },
    include: { images: true, variants: { include: { images: true } } }
  });
  console.log(JSON.stringify(p, null, 2));
}

main().finally(() => prisma.$disconnect());
