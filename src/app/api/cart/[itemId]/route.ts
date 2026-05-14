import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { itemId } = await context.params;
    const body = (await request.json()) as { quantity?: number };

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Geçerli quantity gerekli." },
        { status: 400 },
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: user.id },
      },
      include: {
        variant: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Sepet ürünü bulunamadı." },
        { status: 404 },
      );
    }

    if (cartItem.variant.stock < body.quantity) {
      return NextResponse.json(
        { success: false, message: "Yeterli stok yok." },
        { status: 409 },
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: body.quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("PATCH CART ITEM ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sepet güncellenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { itemId } = await context.params;

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: user.id },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Sepet ürünü bulunamadı." },
        { status: 404 },
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("DELETE CART ITEM ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ürün sepetten silinemedi." },
      { status: 500 },
    );
  }
}
