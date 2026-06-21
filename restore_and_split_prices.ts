import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as xlsx from 'xlsx';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Loading Excel file...");
  const workbook = xlsx.readFile('./public/urunlerTablosu.xls');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[];

  console.log("Fetching all variants from DB...");
  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true }
  });

  const exchangeRate = 46.45;
  let updatedCount = 0;

  console.log(`Found ${variants.length} variants in DB. Starting sync...`);

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

  const chunkSize = 10;
  for (let i = 0; i < variants.length; i += chunkSize) {
    const chunk = variants.slice(i, i + chunkSize);
    
    const promises = chunk.map(v => {
      const excelData = excelMap.get(v.sku);
      
      if (excelData) {
        return prisma.productVariant.update({
          where: { id: v.id },
          data: {
            buyPrice: excelData.buyPrice,
            branchPrice: excelData.branchPrice,
            wholesalePrice: excelData.wholesalePrice,
            retailPrice: excelData.retailPrice,
            price: excelData.buyPrice,
            dealerPrice: excelData.buyPrice
          }
        });
      }
      return null;
    }).filter(Boolean);

    if (promises.length > 0) {
      for (const p of promises) { await p; }
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
    console.log("Done");
  });
