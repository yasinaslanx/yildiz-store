import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { variantId } = await context.params;

    // Varyantı sil (ilgili görseller vs. Cascade varsa silinir)
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true, message: "Varyant silindi." });
  } catch (error) {
    console.error("DELETE VARIANT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Varyant silinemedi." },
      { status: 500 }
    );
  }
}
