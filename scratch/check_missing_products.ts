import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import * as xlsx from 'xlsx';
import * as path from 'path';

async function main() {
  const filePath = path.join(process.cwd(), 'public', 'urunlerTablosu.xls');
  
  console.log("Reading file:", filePath);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Headers are at data[2]
  const headers = data[2] as string[];
  const skuIndex = 0; // Kart Kodu
  const nameIndex = 1; // Açıklama


  console.log(`Using SKU index ${skuIndex} and Name index ${nameIndex}`);

  const missingProducts = [];
  const foundProducts = [];
  
  // Get all SKUs from DB
  const variants = await prisma.productVariant.findMany({ select: { sku: true } });
  const dbSkus = new Set(variants.map(v => v.sku));

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const sku = String(row[skuIndex] || '').trim();
    const name = String(row[nameIndex] || '').trim();
    
    if (!sku) continue;
    
    if (!dbSkus.has(sku)) {
      missingProducts.push({ sku, name });
    } else {
      foundProducts.push(sku);
    }
  }

  console.log(`\nResults:`);
  console.log(`Total rows in Excel: ${data.length - 1}`);
  console.log(`Products found in DB: ${foundProducts.length}`);
  console.log(`Missing products: ${missingProducts.length}`);
  
  if (missingProducts.length > 0) {
    console.log("\nFirst 20 missing products:");
    missingProducts.slice(0, 20).forEach(p => {
      console.log(`- SKU: ${p.sku} | Name: ${p.name}`);
    });
  } else {
    console.log("All products from Excel are present in the system!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
