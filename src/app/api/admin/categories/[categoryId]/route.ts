import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { categoryId } = await context.params;
    const body = await request.json();

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        active: body.active,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Kategori güncellenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { categoryId } = await context.params;
    
    // URL'den parametreleri al (deleteProducts=true ise ürünleri de sil)
    const url = new URL(request.url);
    const deleteProducts = url.searchParams.get("deleteProducts") === "true";

    if (deleteProducts) {
      // Önce bu kategoriye ait ürünleri tamamen sil (varyantları vs. Cascade ile silinir)
      await prisma.product.deleteMany({
        where: { categoryId },
      });
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true, message: "Kategori silindi." });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kategori silinemedi." },
      { status: 500 }
    );
  }
}
