import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const USD_RATE = 46.47;

const priceMap: Record<string, { alis: number, toptan: number, sube: number, perakende?: number }> = {
  'wt4': { alis: 29.7, toptan: 38.61, sube: 32.67 }, // WT-4 PRO
  'wt5': { alis: 29.15, toptan: 37.9, sube: 32.1 },  // WT-5 PRO
  'wt6': { alis: 29.15, toptan: 37.9, sube: 32.1 },  // Use WT-5 prices for WT-6
  'watch8': { alis: 32, toptan: 42, sube: 35.2 },   // SUNİX WATCH 8
  'gh8032': { alis: 8.5, toptan: 11.05, sube: 9.35 } // DELUXSE GH-8032
};

function getMapKey(name: string): string | null {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n.includes('wt4')) return 'wt4';
  if (n.includes('wt5')) return 'wt5';
  if (n.includes('wt6')) return 'wt6';
  if (n.includes('watch8')) return 'watch8';
  if (n.includes('gh8032')) return 'gh8032';
  return null;
}

async function main() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true }
  });

  let updated = 0;

  for (const v of variants) {
    if (!v.product) continue;
    
    // Check if this watch is stuck at ~500 TL (or basically below 600 TL but should be higher)
    // Actually, let's just update all variants of these watches to be consistent!
    const key = getMapKey(v.product.name);
    
    if (key) {
      const data = priceMap[key];
      const buyPrice = data.alis * USD_RATE;
      const wholesalePrice = data.toptan * USD_RATE;
      const branchPrice = data.sube * USD_RATE;
      const price = data.perakende ? data.perakende * USD_RATE : wholesalePrice;

      // Ensure we always update to the correct mapped price
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          buyPrice,
          price,
          wholesalePrice,
          branchPrice
        }
      });
      console.log(`Fixed ${v.product.name} (was ${v.price}) -> new price: ${price.toFixed(2)}`);
      updated++;
    }
  }

  console.log(`Updated ${updated} watch variants to correct prices!`);
}

main().finally(() => prisma.$disconnect());
