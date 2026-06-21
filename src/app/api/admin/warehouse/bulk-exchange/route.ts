import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const adminUser = await requirePermission("WAREHOUSE");
    if (!adminUser) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });
    }

    const { exchangeRate } = await request.json();

    if (!exchangeRate || typeof exchangeRate !== 'number' || exchangeRate <= 0) {
      return NextResponse.json({ success: false, message: "Geçersiz kur değeri." }, { status: 400 });
    }

    // Since Prisma does not support mass multiply in updateMany for decimal/float directly in a simple way for all drivers,
    // and we need to process 600-1000 items, we can fetch them and run a transaction.
    const variants = await prisma.productVariant.findMany({
      select: { id: true, price: true, wholesalePrice: true, branchPrice: true, buyPrice: true }
    });

    for (const v of variants) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          price: v.price ? Number(v.price) * exchangeRate : 0,
          wholesalePrice: v.wholesalePrice ? Number(v.wholesalePrice) * exchangeRate : null,
          branchPrice: v.branchPrice ? Number(v.branchPrice) * exchangeRate : null,
          buyPrice: v.buyPrice ? Number(v.buyPrice) * exchangeRate : null,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Tüm fiyatlar kura göre başarıyla güncellendi.",
      count: variants.length
    });

  } catch (error: any) {
    console.error("Bulk exchange error:", error);
    return NextResponse.json({ success: false, message: "Toplu kur çevirimi sırasında hata oluştu: " + error.message }, { status: 500 });
  }
}
