import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

function formatCartItem(item: any) {
  const variant = item.variant;
  const product = variant.product;

  return {
    id: item.id,
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    variantId: variant.id,
    color: variant.color,
    storage: variant.storage ?? undefined,
    price: Number(variant.price),
    quantity: item.quantity,
    image: variant.images?.[0]?.url ?? product.images?.[0]?.url ?? "",
    slug: product.slug,
  };
}

export async function GET() {
  try {
    const user = await requireSessionUser();

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                images: true,
                product: { include: { images: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cart?.items.map(formatCartItem) ?? [],
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sepet alınamadı." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();

    const body = (await request.json()) as {
      variantId?: string;
      quantity?: number;
    };

    if (!body.variantId) {
      return NextResponse.json(
        { success: false, message: "variantId gerekli." },
        { status: 400 },
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: body.variantId },
      select: { id: true, stock: true, active: true },
    });

    if (!variant || !variant.active) {
      return NextResponse.json(
        { success: false, message: "Ürün varyantı bulunamadı." },
        { status: 404 },
      );
    }

    if (variant.stock < (body.quantity ?? 1)) {
      return NextResponse.json(
        { success: false, message: "Yeterli stok yok." },
        { status: 409 },
      );
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: body.variantId,
        },
      },
    });

    if (existing) {
      const nextQuantity = existing.quantity + (body.quantity ?? 1);

      if (variant.stock < nextQuantity) {
        return NextResponse.json(
          { success: false, message: "Stok miktarından fazla ürün eklenemez." },
          { status: 409 },
        );
      }

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: body.variantId,
          quantity: body.quantity ?? 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("POST CART ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sepete eklenemedi." },
      { status: 500 },
    );
  }
}
