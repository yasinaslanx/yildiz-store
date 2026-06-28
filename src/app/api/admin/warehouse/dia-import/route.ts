import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import * as xlsx from "xlsx";
import slugify from "slugify";
import { sendTelegramGroupMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const adminUser = await requirePermission("WAREHOUSE");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const exchangeRateStr = formData.get("exchangeRate");
    const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr.toString()) : 1;

    if (!file) {
      return NextResponse.json({ success: false, message: "Dosya bulunamadı." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Dia tablosu her zaman 4. satırdan veriye başlar (header: 1 array döndürür)
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[];

    const stats = {
      newProducts: 0,
      newVariants: 0,
      updatedStocks: 0,
      errors: 0
    };

    // Tüm kategorileri belleğe alalım
    let categories = await prisma.category.findMany();

    const getOrCreateCategory = async (name: string) => {
      let cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: name,
            slug: slugify(name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 6)
          }
        });
        categories.push(cat);
      }
      return cat.id;
    };

    // Array 0'dan başlıyor, genelde veri 4. satırda (index 4)
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const sku = row[0]?.toString().trim();
      const name = row[1]?.toString().trim() || "İsimsiz Ürün";
      const stock = row[3] ? parseInt(row[3].toString().replace(/[^0-9]/g, '')) || 0 : 0;
      
      let buyPrice = row[5] ? parseFloat(row[5]) * exchangeRate : 0;
      let branchPrice = row[6] ? parseFloat(row[6]) * exchangeRate : 0;
      let wholesalePrice = row[7] ? parseFloat(row[7]) * exchangeRate : 0;
      let retailPrice = row[8] ? parseFloat(row[8]) * exchangeRate : 0;

      if (!sku) continue;

      const existingVariant = await prisma.productVariant.findUnique({
        where: { sku: sku }
      });

      if (existingVariant) {
        // Mevcut ürünü güncelle (SADECE stok ve alış fiyatı! Kullanıcının özel zamlarını ezme)
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: { stock: stock, buyPrice: buyPrice, branchPrice: branchPrice, wholesalePrice: wholesalePrice, retailPrice: retailPrice }
        });
        stats.updatedStocks++;

        // Log
        await prisma.stockLog.create({
          data: {
            variantId: existingVariant.id,
            userId: adminUser.id,
            previousStock: existingVariant.stock,
            newStock: stock,
            change: stock - existingVariant.stock,
            reason: "Dia Entegrasyonu ile Otomatik Güncelleme"
          }
        });
      } else {
        // Yepyeni Ürün!
        // Kategori Tahmini
        const nUpper = name.toUpperCase();
        let catName = "DİĞER";
        if (nUpper.includes("KULAKLIK")) catName = "KULAKLIKLAR";
        else if (nUpper.includes("KABLO") || nUpper.includes("DÖNÜŞTÜRÜCÜ") || nUpper.includes("AUX")) catName = "KABLOLAR VE DÖNÜŞTÜRÜCÜLER";
        else if (nUpper.includes("BATARYA")) catName = "BATARYALAR";
        else if (nUpper.includes("HAFIZA") || nUpper.includes("FLAŞH")) catName = "HAFIZA ÜRÜNLERİ";
        else if (nUpper.includes("TUTACAĞI") || nUpper.includes("TUTUCU")) catName = "ARAÇ TUTUCULAR";
        else if (nUpper.includes("CAM") || nUpper.includes("JELATİN")) catName = "EKRAN KORUYUCULAR";
        else if (nUpper.includes("SPEAKER")) catName = "HOPARLÖRLER";

        const categoryId = await getOrCreateCategory(catName);

        // Ürün adı daha önce varsa varyant ekle (Aynı isme sahip renk vs farklıysa)
        let product = await prisma.product.findFirst({
          where: { name: name }
        });

        if (!product) {
          const baseSlug = slugify(name, { lower: true, strict: true });
          const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().substring(8)}`;
          
          product = await prisma.product.create({
            data: {
              name: name,
              slug: uniqueSlug,
              description: name,
              brand: "Bilinmiyor",
              categoryId: categoryId
            }
          });
          stats.newProducts++;
        }

        const newVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: sku,
            color: "Standart",
            stock: stock, buyPrice: buyPrice, branchPrice: branchPrice, wholesalePrice: wholesalePrice, retailPrice: retailPrice, price: retailPrice, dealerPrice: branchPrice
          }
        });
        stats.newVariants++;

        await prisma.stockLog.create({
          data: {
            variantId: newVariant.id,
            userId: adminUser.id,
            previousStock: 0,
            newStock: stock,
            change: stock,
            reason: "Dia Entegrasyonu ile Yeni Ürün Eklendi"
          }
        });
      }
    }

    // Gruba bildirim gönder
    if (stats.newProducts > 0 || stats.updatedStocks > 0) {
      let groupMessage = `🔥 *BÜYÜK STOK GÜNCELLEMESİ* 🔥\n\nDepomuza yeni ürünler ve stoklar eklendi!\n\n`;
      if (stats.newProducts > 0) groupMessage += `📦 *${stats.newProducts} Adet* Yepyeni Ürün Geldi!\n`;
      if (stats.updatedStocks > 0) groupMessage += `✅ *${stats.updatedStocks} Adet* Ürünün Stoğu Yenilendi!\n`;
      groupMessage += `\nSipariş vermek ve ürünleri incelemek için hemen sisteme giriş yapın. Bayilerimize özel fiyatları kaçırmayın!`;
      
      // Arka planda asenkron gönder, bekleme yapmasın
      sendTelegramGroupMessage(groupMessage).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: `Dia Aktarımı Tamamlandı! ${stats.newProducts} yeni ürün, ${stats.newVariants} yeni varyant oluşturuldu. ${stats.updatedStocks} ürün güncellendi.`,
      stats
    });

  } catch (error: any) {
    console.error("DIA IMPORT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası: " + (error?.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
}
