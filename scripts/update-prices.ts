import 'dotenv/config';
import * as xlsx from 'xlsx';
import { prisma } from '../src/lib/prisma';

const USD_RATE = 46.47;

async function main() {
  const workbook = xlsx.readFile('public/urunlerTablosu.xls');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  let updatedCount = 0;
  
  // Skip the first row as it contains headers
  const productsData = data.slice(1);

  for (const row of productsData as any[]) {
    const name = String(row['__EMPTY_1'] || '').trim();
    const alisFiyatiUsd = row['__EMPTY_4'];
    
    if (!name || typeof alisFiyatiUsd !== 'number') continue;

    const isWatch = name.toLowerCase().includes('saat') || name.toLowerCase().includes('watch') || name.toLowerCase().includes('akıllı');
    
    if (isWatch && !name.toLowerCase().includes('şarz') && !name.toLowerCase().includes('şarj') && !name.toLowerCase().includes('kordon')) {
      
      const subeFiyatiUsd = row['__EMPTY_5'];
      const toptanSatisUsd = row['__EMPTY_6'];
      const perakendeSatisUsd = row['__EMPTY_7'];

      const alisFiyatiTl = alisFiyatiUsd * USD_RATE;
      const subeFiyatiTl = typeof subeFiyatiUsd === 'number' && subeFiyatiUsd > 0 ? subeFiyatiUsd * USD_RATE : null;
      const toptanSatisTl = typeof toptanSatisUsd === 'number' && toptanSatisUsd > 0 ? toptanSatisUsd * USD_RATE : null;
      const perakendeSatisTl = typeof perakendeSatisUsd === 'number' && perakendeSatisUsd > 0 ? perakendeSatisUsd * USD_RATE : null;

      // Base price is usually perakende or toptan if perakende is missing/zero
      const priceTl = perakendeSatisTl || toptanSatisTl || alisFiyatiTl;

      const searchName = name.replace(/^SUNİX\s+/i, '').trim();

      const existingProducts = await prisma.product.findMany({
        where: {
          name: {
            contains: searchName,
            mode: 'insensitive'
          }
        },
        include: { variants: true }
      });

      if (existingProducts.length > 0) {
        for (const prod of existingProducts) {
          if (prod.variants[0]) {
            console.log(`Updating ${prod.name} | Alış: ${alisFiyatiTl.toFixed(2)}, Şube: ${subeFiyatiTl?.toFixed(2)}, Toptan: ${toptanSatisTl?.toFixed(2)}, Perakende: ${perakendeSatisTl?.toFixed(2)}`);
            await prisma.productVariant.update({
              where: { id: prod.variants[0].id },
              data: {
                buyPrice: alisFiyatiTl,
                price: priceTl, // Setting base selling price
                wholesalePrice: toptanSatisTl,
                retailPrice: perakendeSatisTl,
                branchPrice: subeFiyatiTl
              }
            });
            updatedCount++;
          }
        }
      } else {
        console.log(`Not found in DB: ${name}`);
      }
    }
  }
  
  console.log(`Updated ${updatedCount} watches.`);
}

main().finally(() => prisma.$disconnect());
