import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "urunlerTablosu.xls");
    const buffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[];

    const variants = await prisma.productVariant.findMany({
      select: { id: true, sku: true }
    });

    const exchangeRate = 46.45;
    let updatedCount = 0;

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

    const chunkSize = 50;
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
        await prisma.$transaction(promises as any);
        updatedCount += promises.length;
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
