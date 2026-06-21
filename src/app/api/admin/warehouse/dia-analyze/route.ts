import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const filePath = 'C:/Users/Monster/.gemini/antigravity-ide/brain/d533b24b-7da1-4ead-9b56-ca0b0573cae3/scratch/excel_data.json';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let totalInExcel = 0;
    const excelSkus = new Set();
    const missingProducts: any[] = [];
    const existingProducts: any[] = [];
    
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

    const categoryCounts: Record<string, number> = {};
    missingProducts.forEach(p => {
      const pName = (p.name || "").toUpperCase();
      let cat = "DİĞER";
      if (pName.includes("KULAKLIK")) cat = "KULAKLIKLAR";
      else if (pName.includes("KABLO") || pName.includes("DÖNÜŞTÜRÜCÜ") || pName.includes("AUX")) cat = "KABLOLAR VE DÖNÜŞTÜRÜCÜLER";
      else if (pName.includes("BATARYA")) cat = "BATARYALAR";
      else if (pName.includes("HAFIZA KARTI") || pName.includes("FLAŞH")) cat = "HAFIZA ÜRÜNLERİ";
      else if (pName.includes("TUTACAĞI") || pName.includes("TUTUCU")) cat = "ARAÇ TUTUCULAR";
      else if (pName.includes("CAM") || pName.includes("JELATİN")) cat = "EKRAN KORUYUCULAR";
      else if (pName.includes("SPEAKER")) cat = "HOPARLÖRLER";
      
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return NextResponse.json({
      totalInExcel,
      existingInDb: existingProducts.length,
      missingInDb: missingProducts.length,
      categoryGuessesForMissing: categoryCounts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
