import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, percentage, targetSku } = await req.json();

    if (!action || (action !== "increase" && action !== "decrease")) {
      return NextResponse.json({ error: "Geçersiz işlem türü" }, { status: 400 });
    }

    if (!percentage || typeof percentage !== "number" || percentage <= 0) {
      return NextResponse.json({ error: "Geçersiz yüzde değeri" }, { status: 400 });
    }

    const multiplier = action === "increase" ? (1 + percentage / 100) : (1 - percentage / 100);

    if (targetSku) {
      // Find the specific variant
      const variant = await prisma.productVariant.findUnique({
        where: { sku: targetSku },
      });

      if (!variant) {
        return NextResponse.json({ error: "Ürün kodu (SKU) bulunamadı" }, { status: 404 });
      }

      // Calculate new price and round it (e.g. 500.5 -> 501, 500.4 -> 500)
      const newPrice = Math.round(variant.price * multiplier);

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { price: newPrice },
      });

      return NextResponse.json({ success: true, message: `SKU: ${targetSku} güncellendi.` });
    } else {
      // Fetch all variants
      const variants = await prisma.productVariant.findMany({
        select: { id: true, price: true }
      });

      // Update all variants in a transaction
      const updatePromises = variants.map(v => {
        const newPrice = Math.round(v.price * multiplier);
        return prisma.productVariant.update({
          where: { id: v.id },
          data: { price: newPrice }
        });
      });

      // Execute in chunks of 50 to avoid connection overload if there are many products
      const chunkSize = 50;
      for (let i = 0; i < updatePromises.length; i += chunkSize) {
        const chunk = updatePromises.slice(i, i + chunkSize);
        await prisma.$transaction(chunk);
      }

      return NextResponse.json({ success: true, message: `Tüm ürünler ${action === 'increase' ? 'zamlandı' : 'indirime girdi'}.` });
    }
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Fiyatlar güncellenirken bir hata oluştu" }, { status: 500 });
  }
}
