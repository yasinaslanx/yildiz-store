import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    const invalidBrands = ["bilinmiyor", "belirtilmemiş", "yok", "diğer", "tanımsız"];

    const brands = products
      .map((p) => p.brand)
      .filter((b) => b && b.trim() !== "")
      .filter((b) => !invalidBrands.includes(b!.trim().toLowerCase()));

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("GET BRANDS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Markalar alınamadı." },
      { status: 500 }
    );
  }
}
