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
