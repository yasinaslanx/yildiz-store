require('dotenv').config({ path: '.env' });
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const exchangeRate = 46.45;
    const filePath = './public/urunlerTablosu.xls';
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Excel dosyasından fiyatlar okunuyor...`);
    let updated = 0;

    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const sku = row[0].toString().trim();
      let buyPrice = row[5] ? parseFloat(row[5]) : 0;
      let branchPrice = row[6] ? parseFloat(row[6]) : 0;
      let wholesalePrice = row[7] ? parseFloat(row[7]) : 0;
      let retailPrice = row[8] ? parseFloat(row[8]) : 0;

      // Eğer perakende fiyatı 0 ise (Dia'da girilmemişse), toptan veya alış fiyatı üzerinden otomatik hesapla
      if (retailPrice === 0) {
        if (wholesalePrice > 0) retailPrice = wholesalePrice * 1.3; // Toptan + %30
        else if (branchPrice > 0) retailPrice = branchPrice * 1.4;  // Bayi + %40
        else if (buyPrice > 0) retailPrice = buyPrice * 1.6;        // Alış + %60
      }

      // Kur ile çarp (TL'ye çevir)
      buyPrice = buyPrice * exchangeRate;
      branchPrice = branchPrice * exchangeRate;
      wholesalePrice = wholesalePrice * exchangeRate;
      retailPrice = retailPrice * exchangeRate;

      // Veritabanında güncelle
      const existing = await prisma.productVariant.findUnique({ where: { sku } });
      if (existing) {
        await prisma.productVariant.update({
          where: { sku },
          data: {
            price: retailPrice,
            wholesalePrice: wholesalePrice || null,
            branchPrice: branchPrice || null,
            buyPrice: buyPrice || null,
          }
        });
        updated++;
        if (updated % 100 === 0) console.log(`${updated} ürün güncellendi...`);
      }
    }

    console.log(`Tamamlandı! Toplam ${updated} ürünün fiyatı Excel'den doğru şekilde güncellendi.`);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
