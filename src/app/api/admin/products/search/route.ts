import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const queryTerms = query.split(/\s+/).filter(Boolean);
    const nameConditions = queryTerms.map(term => ({
      name: { contains: term, mode: "insensitive" as const }
    }));

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { AND: nameConditions },
          { variants: { some: { sku: { contains: query, mode: "insensitive" } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        images: {
          take: 1,
          select: { url: true }
        },
        variants: {
          take: 1,
          select: { wholesalePrice: true, price: true }
        }
      },
      take: 10
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json({ success: false, message: "Arama sırasında bir hata oluştu" }, { status: 500 });
  }
}
