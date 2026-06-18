import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requirePermission("MARKETING");
    const { id } = await context.params;
    const body = await request.json();

    const updated = await prisma.bundleDeal.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.discountPercent !== undefined && { discountPercent: Number(body.discountPercent) }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.triggerProductId !== undefined && { triggerProductId: body.triggerProductId }),
        ...(body.bundleProductId !== undefined && { bundleProductId: body.bundleProductId }),
        ...(body.startsAt !== undefined && { startsAt: body.startsAt ? new Date(body.startsAt) : null }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH BUNDLE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Bundle güncellenemedi." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requirePermission("MARKETING");
    const { id } = await context.params;

    await prisma.bundleDeal.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Bundle kampanyası silindi." });
  } catch (error: any) {
    console.error("DELETE BUNDLE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Bundle silinemedi." },
      { status: error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN" ? 403 : 500 }
    );
  }
}
