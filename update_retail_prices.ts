import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting to update retail prices...");
  
  const variants = await prisma.productVariant.findMany();
  console.log(`Found ${variants.length} variants in DB. Starting update...`);
  
  let updatedCount = 0;
  
  for (const variant of variants) {
    const buyPrice = variant.buyPrice || 0;
    const newRetailPrice = buyPrice * 1.50; // Alış fiyatına %50 zam
    
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        retailPrice: newRetailPrice
      }
    });
    
    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`Processed ${updatedCount} variants...`);
    }
  }
  
  console.log(`\nUpdate completed! Successfully updated ${updatedCount} variants.`);
  console.log("All retailPrices are now exactly buyPrice + 50%.");
}

main()
  .catch((e) => {
    console.error("An error occurred:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
