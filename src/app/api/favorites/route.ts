import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

function formatFavorite(item: any) {
  const variant = item.variant;
  const product = variant.product;

  return {
    id: variant.id,
    favoriteId: item.id,
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    slug: product.slug,
    image: variant.images?.[0]?.url ?? product.images?.[0]?.url ?? "",
    price: Number(variant.price),
  };
}

export async function GET() {
  try {
    const user = await requireSessionUser();

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        variant: {
          include: {
            images: true,
            product: { include: { images: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: favorites.map(formatFavorite),
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("GET FAVORITES ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Favoriler alınamadı." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();

    const body = (await request.json()) as {
      variantId?: string;
    };

    if (!body.variantId) {
      return NextResponse.json(
        { success: false, message: "variantId gerekli." },
        { status: 400 },
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: body.variantId },
      select: { id: true, active: true },
    });

    if (!variant || !variant.active) {
      return NextResponse.json(
        { success: false, message: "Ürün varyantı bulunamadı." },
        { status: 404 },
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_variantId: {
          userId: user.id,
          variantId: body.variantId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        data: { active: false },
      });
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        variantId: body.variantId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { active: true },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("POST FAVORITES ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Favori güncellenemedi." },
      { status: 500 },
    );
  }
}
