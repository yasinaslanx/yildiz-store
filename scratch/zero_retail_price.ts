import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Sıfırlama işlemi başlıyor...");
  
  // Update all ProductVariants to set price (Perakende) to 0
  const result = await prisma.productVariant.updateMany({
    data: {
      price: 0,
      // retailPrice: 0 // If retailPrice is also used, zero it out too just in case. But price is the main one.
    }
  });

  const result2 = await prisma.productVariant.updateMany({
      data: {
        retailPrice: 0
      }
  });

  console.log(`İşlem tamamlandı! ${result.count} varyantın perakende fiyatı (price) sıfırlandı.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
