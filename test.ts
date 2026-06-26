import { prisma } from "./src/lib/prisma";

async function main() {
  const p = await prisma.product.findFirst({
    where: { name: { contains: "Sunproof" } },
    include: { variants: true, dealerOffers: true }
  });
  console.log(JSON.stringify(p, null, 2));
}

main();
