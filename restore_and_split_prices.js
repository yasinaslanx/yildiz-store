const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  console.log("Loading Excel file...");
  const workbook = xlsx.readFile('./public/urunlerTablosu.xls');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  console.log("Fetching all variants from DB...");
  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true }
  });

  const exchangeRate = 46.45;
  let updatedCount = 0;

  console.log(`Found ${variants.length} variants in DB. Starting sync...`);

  // Map excel rows by SKU
  const excelMap = new Map();
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    
    const sku = row[0].toString().trim();
    excelMap.set(sku, {
      buyPrice: row[5] ? parseFloat(row[5]) * exchangeRate : 0,
      branchPrice: row[6] ? parseFloat(row[6]) * exchangeRate : 0,
      wholesalePrice: row[7] ? parseFloat(row[7]) * exchangeRate : 0,
      retailPrice: row[8] ? parseFloat(row[8]) * exchangeRate : 0,
    });
  }

  // Group updates into chunks to avoid memory/connection limits
  const chunkSize = 50;
  for (let i = 0; i < variants.length; i += chunkSize) {
    const chunk = variants.slice(i, i + chunkSize);
    
    const promises = chunk.map(v => {
      const excelData = excelMap.get(v.sku);
      
      // If found in Excel, update everything from it. Otherwise, assume prices are 0 or leave as is?
      // Since we want to normalize, if not found in excel, just set dealer/price to current buyPrice to be safe?
      if (excelData) {
        return prisma.productVariant.update({
          where: { id: v.id },
          data: {
            buyPrice: excelData.buyPrice,
            branchPrice: excelData.branchPrice,
            wholesalePrice: excelData.wholesalePrice,
            retailPrice: excelData.retailPrice,
            // Sitedeki fiyatlar kullanıcının isteği üzerine alış fiyatından başlıyor
            price: excelData.buyPrice,
            dealerPrice: excelData.buyPrice
          }
        });
      } else {
        // If sku not in excel for some reason, maybe it was deleted or changed.
        // Leave its reference prices alone, but normalize site prices to whatever buyPrice is currently
        return null;
      }
    }).filter(Boolean);

    if (promises.length > 0) {
      await prisma.$transaction(promises);
      updatedCount += promises.length;
    }
    
    console.log(`Processed ${i + chunk.length} variants...`);
  }

  console.log(`Sync completed! Updated ${updatedCount} variants from Excel.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
