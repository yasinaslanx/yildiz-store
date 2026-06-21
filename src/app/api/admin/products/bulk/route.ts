import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, type = "percentage", amount, targetSku, priceTarget = "price" } = await req.json();

    if (!action || (action !== "increase" && action !== "decrease")) {
      return NextResponse.json({ error: "Geçersiz işlem türü" }, { status: 400 });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Geçersiz miktar/yüzde değeri" }, { status: 400 });
    }

    const calculateNewPrice = (currentPrice: any) => {
      const p = Number(currentPrice);
      if (isNaN(p) || p <= 0) return null; // Sıfır olan fiyatı güncelleme

      let newPrice = p;
      if (type === "percentage") {
        const multiplier = action === "increase" ? (1 + amount / 100) : (1 - amount / 100);
        newPrice = p * multiplier;
      } else if (type === "flat") {
        newPrice = action === "increase" ? (p + amount) : (p - amount);
      }

      // Eksi fiyata düşmesine izin verme
      if (newPrice < 0) newPrice = 0;
      
      return Math.round(newPrice * 100) / 100; // 2 decimal precision
    };

    const validTargets = ["price", "dealerPrice", "wholesalePrice", "branchPrice", "buyPrice", "retailPrice", "all_site", "all_reference"];

    if (!validTargets.includes(priceTarget)) {
      return NextResponse.json({ error: "Geçersiz fiyat hedefi" }, { status: 400 });
    }

    const buildUpdateData = (v: any) => {
      const data: any = {};
      
      if (priceTarget === "price" || priceTarget === "all_site") {
        const p = calculateNewPrice(v.price);
        if (p !== null) data.price = p;
      }
      if (priceTarget === "dealerPrice" || priceTarget === "all_site") {
        const p = calculateNewPrice(v.dealerPrice || v.price); // Eğer bayii fiyatı yoksa müşteri fiyatından baz al
        if (p !== null) data.dealerPrice = p;
      }
      if (priceTarget === "wholesalePrice" || priceTarget === "all_reference") {
        const p = calculateNewPrice(v.wholesalePrice);
        if (p !== null) data.wholesalePrice = p;
      }
      if (priceTarget === "branchPrice" || priceTarget === "all_reference") {
        const p = calculateNewPrice(v.branchPrice);
        if (p !== null) data.branchPrice = p;
      }
      if (priceTarget === "buyPrice" || priceTarget === "all_reference") {
        const p = calculateNewPrice(v.buyPrice);
        if (p !== null) data.buyPrice = p;
      }
      if (priceTarget === "retailPrice" || priceTarget === "all_reference") {
        const p = calculateNewPrice(v.retailPrice);
        if (p !== null) data.retailPrice = p;
      }

      if (Object.keys(data).length === 0) return null;
      return data;
    };

    if (targetSku) {
      // Find the specific variant
      const variant = await prisma.productVariant.findUnique({
        where: { sku: targetSku },
      });

      if (!variant) {
        return NextResponse.json({ error: "Ürün kodu (SKU) bulunamadı" }, { status: 404 });
      }

      const data = buildUpdateData(variant);
      if (!data) {
        return NextResponse.json({ error: "Güncellenecek geçerli bir fiyat bulunamadı (Fiyat 0 olabilir)." }, { status: 400 });
      }

      await prisma.productVariant.update({
        where: { id: variant.id },
        data
      });

      return NextResponse.json({ success: true, message: `SKU: ${targetSku} başarıyla güncellendi.` });
    } else {
      // Fetch all variants
      const variants = await prisma.productVariant.findMany({
        select: { id: true, price: true, dealerPrice: true, wholesalePrice: true, branchPrice: true, buyPrice: true, retailPrice: true }
      });

      const prismaPromises = variants.map(v => {
        const data = buildUpdateData(v);
        if (!data) return null;
        return prisma.productVariant.update({
          where: { id: v.id },
          data
        });
      }).filter(Boolean);

      // Execute in chunks
      const chunkSize = 50;
      for (let i = 0; i < prismaPromises.length; i += chunkSize) {
        const chunk = prismaPromises.slice(i, i + chunkSize);
        await prisma.$transaction(chunk as any[]);
      }

      return NextResponse.json({ success: true, message: `Tüm ürünler ${action === 'increase' ? 'zamlandı' : 'indirime girdi'}. (${prismaPromises.length} varyant güncellendi)` });
    }
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Fiyatlar güncellenirken bir hata oluştu" }, { status: 500 });
  }
}
