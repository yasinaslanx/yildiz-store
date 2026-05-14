const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkStock() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true }
  });
  
  console.log("--- PRODUCT STOCK CHECK ---");
  variants.forEach(v => {
    console.log(`${v.product.name} (${v.color}${v.storage ? ' - ' + v.storage : ''}): ${v.stock} pcs`);
  });
  
  const lowStock = variants.filter(v => v.stock <= 0);
  if (lowStock.length > 0) {
    console.log("\n!!! LOW STOCK ALERT !!!");
    lowStock.forEach(v => console.log(`${v.product.name} is OUT OF STOCK (${v.id})`));
  }
  
  await prisma.$disconnect();
}

checkStock();
