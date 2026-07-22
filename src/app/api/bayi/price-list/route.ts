import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import * as XLSX from "xlsx";

const TIER_DISCOUNTS: Record<string, number> = {
  BRONZE: 3,
  SILVER: 6,
  GOLD: 10,
};

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "DEALER" && sessionUser.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "excel";

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { dealerTier: true },
    });

    const tier = user?.dealerTier || "BRONZE";
    const discountPercent = TIER_DISCOUNTS[tier] || 0;

    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: {
          where: { active: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const priceList: {
      "Kategori": string;
      "Marka": string;
      "Ürün Adı": string;
      "Renk": string;
      "Hafıza": string;
      "Stok": number;
      "Perakende Fiyatı (₺)": number;
      "Toptan Liste Fiyatı (₺)": number;
      "Kademe": string;
      "Kademe İndirimi": string;
      "Net Bayi Özel Fiyatı (₺)": number;
    }[] = [];

    for (const p of products) {
      for (const v of p.variants) {
        const wholesalePrice = v.wholesalePrice ? Number(v.wholesalePrice) : Number(v.price);
        const netDealerPrice = Number((wholesalePrice * (1 - discountPercent / 100)).toFixed(2));

        priceList.push({
          "Kategori": p.category?.name || "Genel",
          "Marka": p.brand || "Sunix",
          "Ürün Adı": p.name,
          "Renk": v.color || "-",
          "Hafıza": v.storage || "-",
          "Stok": v.stock,
          "Perakende Fiyatı (₺)": Number(v.price),
          "Toptan Liste Fiyatı (₺)": wholesalePrice,
          "Kademe": `${tier} Bayi`,
          "Kademe İndirimi": `%${discountPercent}`,
          "Net Bayi Özel Fiyatı (₺)": netDealerPrice,
        });
      }
    }

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(priceList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bayi Fiyat Listesi");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="Sunix_Bayi_Fiyat_Listesi_${tier}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      });
    }

    // Default HTML print format for PDF
    return NextResponse.json({
      success: true,
      data: {
        tier,
        discountPercent,
        priceList,
      },
    });
  } catch (error: unknown) {
    console.error("GET DEALER PRICE LIST ERROR:", error);
    return NextResponse.json({ success: false, message: "Fiyat listesi alınamadı." }, { status: 500 });
  }
}
