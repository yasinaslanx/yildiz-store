const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        include: {
          images: true
        }
      },
      images: true
    }
  });

  console.log(JSON.stringify(products, null, 2));
}

main();
