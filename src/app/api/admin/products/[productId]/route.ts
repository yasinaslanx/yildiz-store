import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { productId } = await context.params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        brand: body.brand,
        active: body.active,
        ...(body.isEarlyAccess !== undefined ? { isEarlyAccess: body.isEarlyAccess } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ürün güncellenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { productId } = await context.params;

    // Ürünü sil (Prisma'daki onDelete: Cascade sayesinde varyantlar ve görseller otomatik silinir)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Ürün silindi." });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Ürün silinemedi." },
      { status: 500 }
    );
  }
}
