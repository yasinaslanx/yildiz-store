const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function analyze() {
  const filePath = './public/urunlerTablosu.xls';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Data starts at index 4 usually based on previous parse
  let totalInExcel = 0;
  const excelSkus = new Set();
  const missingProducts = [];
  const existingProducts = [];
  
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;
    
    const sku = row[0].toString().trim();
    const name = row[1] ? row[1].toString().trim() : '';
    const stock = row[3] ? Number(row[3]) : 0;
    
    totalInExcel++;
    excelSkus.add(sku);
    
    const dbVariant = await prisma.productVariant.findUnique({
      where: { sku: sku }
    });
    
    if (dbVariant) {
      existingProducts.push({ sku, name, stock });
    } else {
      missingProducts.push({ sku, name, stock });
    }
  }

  // Categories extraction based on name heuristics (since it's missing from Dia)
  const categoryCounts = {};
  missingProducts.forEach(p => {
    let cat = "DİĞER";
    if (p.name.includes("KULAKLIK")) cat = "KULAKLIKLAR";
    else if (p.name.includes("KABLO") || p.name.includes("DÖNÜŞTÜRÜCÜ") || p.name.includes("AUX")) cat = "KABLOLAR VE DÖNÜŞTÜRÜCÜLER";
    else if (p.name.includes("BATARYA")) cat = "BATARYALAR";
    else if (p.name.includes("HAFIZA KARTI") || p.name.includes("FLAŞH")) cat = "HAFIZA ÜRÜNLERİ";
    else if (p.name.includes("TUTACAĞI") || p.name.includes("TUTUCU")) cat = "ARAÇ TUTUCULAR";
    else if (p.name.includes("CAM") || p.name.includes("JELATİN")) cat = "EKRAN KORUYUCULAR";
    else if (p.name.includes("SPEAKER")) cat = "HOPARLÖRLER";
    
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const report = {
    totalInExcel,
    existingInDb: existingProducts.length,
    missingInDb: missingProducts.length,
    categoryGuessesForMissing: categoryCounts
  };
  
  fs.writeFileSync('dia_analysis_report.json', JSON.stringify(report, null, 2));
  console.log("Analysis complete. Saved to dia_analysis_report.json");
  await prisma.$disconnect();
}

analyze().catch(console.error);
