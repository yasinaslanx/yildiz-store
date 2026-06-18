import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const now = new Date();

    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ success: true, data: [] });
    }

    const bundles = await prisma.bundleDeal.findMany({
      where: {
        triggerProductId: product.id,
        active: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      include: {
        bundleProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            images: { take: 1, orderBy: { order: "asc" } },
            variants: {
              where: { active: true },
              take: 1,
              select: { id: true, price: true, wholesalePrice: true, color: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bundles });
  } catch (error: any) {
    console.error("GET PRODUCT BUNDLES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Bundle önerileri alınamadı." },
      { status: 500 }
    );
  }
}
