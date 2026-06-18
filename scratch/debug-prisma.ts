import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking products...");
    const products = await prisma.product.findMany({
      where: {
        active: true,
        isEarlyAccess: false
      },
      include: {
        category: true,
        variants: {
          include: {
            images: true
          }
        }
      },
      take: 2
    });
    console.log("SUCCESS, found products:", products.length);
  } catch (error) {
    console.error("PRISMA ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
