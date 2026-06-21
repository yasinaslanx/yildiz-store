import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz veri formatı." },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      if (!update.sku || typeof update.stock !== "number") {
        errorCount++;
        continue;
      }

      const variant = await prisma.productVariant.findUnique({
        where: { sku: update.sku },
        select: { id: true, stock: true }
      });

      if (!variant) {
        errorCount++;
        continue;
      }

      // Stok değişmediyse işlem yapma
      if (variant.stock === update.stock) {
        continue;
      }

      const change = update.stock - variant.stock;

      // Hem stoğu güncelle hem log ekle
      await prisma.$transaction([
        prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: update.stock }
        }),
        prisma.stockLog.create({
          data: {
            variantId: variant.id,
            userId: adminUser.id,
            previousStock: variant.stock,
            newStock: update.stock,
            change: change,
            reason: "Toplu Excel Güncellemesi"
          }
        })
      ]);

      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${successCount} ürün güncellendi, ${errorCount} üründe hata oluştu.`,
    });
  } catch (error) {
    console.error("BULK UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Toplu güncelleme başarısız oldu." },
      { status: 500 }
    );
  }
}
