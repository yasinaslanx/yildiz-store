import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, percentage, targetSku, priceTarget = "retail" } = await req.json();

    if (!action || (action !== "increase" && action !== "decrease")) {
      return NextResponse.json({ error: "Geçersiz işlem türü" }, { status: 400 });
    }

    if (!percentage || typeof percentage !== "number" || percentage <= 0) {
      return NextResponse.json({ error: "Geçersiz yüzde değeri" }, { status: 400 });
    }

    const multiplier = action === "increase" ? (1 + percentage / 100) : (1 - percentage / 100);

    const updateVariant = async (v: any) => {
      const data: any = {};
      if (priceTarget === "retail" || priceTarget === "both") {
        data.price = Math.round(Number(v.price) * multiplier);
      }
      if ((priceTarget === "wholesale" || priceTarget === "both") && v.wholesalePrice) {
        data.wholesalePrice = Math.round(Number(v.wholesalePrice) * multiplier);
      }
      
      if (Object.keys(data).length === 0) return null;

      return prisma.productVariant.update({
        where: { id: v.id },
        data
      });
    };

    if (targetSku) {
      // Find the specific variant
      const variant = await prisma.productVariant.findUnique({
        where: { sku: targetSku },
      });

      if (!variant) {
        return NextResponse.json({ error: "Ürün kodu (SKU) bulunamadı" }, { status: 404 });
      }

      const updatePromise = await updateVariant(variant);
      if (!updatePromise) {
        return NextResponse.json({ error: "Güncellenecek geçerli bir fiyat bulunamadı." }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `SKU: ${targetSku} güncellendi.` });
    } else {
      // Fetch all variants
      const variants = await prisma.productVariant.findMany({
        select: { id: true, price: true, wholesalePrice: true }
      });

      // Create promises for valid updates
      const updatePromises = variants
        .map(v => updateVariant(v))
        .filter(Boolean) as Promise<any>[]; // Need to await them inside the transaction mapping, wait, updateVariant is async.
        // Actually, updateVariant returns a Prisma Promise that hasn't executed if we don't await.
        // Let's rewrite this part without async inside map to get the Prisma promises directly.

        const prismaPromises = variants.map(v => {
          const data: any = {};
          if (priceTarget === "retail" || priceTarget === "both") {
            data.price = Math.round(Number(v.price) * multiplier);
          }
          if ((priceTarget === "wholesale" || priceTarget === "both") && v.wholesalePrice) {
            data.wholesalePrice = Math.round(Number(v.wholesalePrice) * multiplier);
          }
          
          if (Object.keys(data).length === 0) return null;
    
          return prisma.productVariant.update({
            where: { id: v.id },
            data
          });
        }).filter(Boolean);

      // Execute in chunks of 50 to avoid connection overload if there are many products
      const chunkSize = 50;
      for (let i = 0; i < prismaPromises.length; i += chunkSize) {
        const chunk = prismaPromises.slice(i, i + chunkSize);
        await prisma.$transaction(chunk as any[]);
      }

      return NextResponse.json({ success: true, message: `Tüm ürünler ${action === 'increase' ? 'zamlandı' : 'indirime girdi'}.` });
    }
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Fiyatlar güncellenirken bir hata oluştu" }, { status: 500 });
  }
}
