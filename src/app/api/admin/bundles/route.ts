import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function GET() {
  try {
    await requirePermission("MARKETING");

    const bundles = await prisma.bundleDeal.findMany({
      include: {
        triggerProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, orderBy: { order: "asc" } },
            variants: { take: 1, select: { price: true } },
          },
        },
        bundleProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, orderBy: { order: "asc" } },
            variants: { take: 1, select: { price: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bundles });
  } catch (error: any) {
    console.error("GET BUNDLES ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Bundle listesi alınamadı." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("MARKETING");

    const body = await request.json();
    const { name, triggerProductId, bundleProductId, discountPercent, startsAt, expiresAt } = body;

    if (!name || !triggerProductId || !bundleProductId || !discountPercent) {
      return NextResponse.json(
        { success: false, message: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    if (triggerProductId === bundleProductId) {
      return NextResponse.json(
        { success: false, message: "Ana ürün ve paket ürünü aynı olamaz." },
        { status: 400 }
      );
    }

    const bundle = await prisma.bundleDeal.create({
      data: {
        name,
        triggerProductId,
        bundleProductId,
        discountPercent: Number(discountPercent),
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    console.error("POST BUNDLE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Bundle oluşturulamadı." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
