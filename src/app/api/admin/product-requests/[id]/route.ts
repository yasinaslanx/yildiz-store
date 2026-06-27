import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await req.json();
    const { status, adminNote, estimatedDays } = body;

    const updatedRequest = await prisma.productRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(estimatedDays !== undefined && { estimatedDays: estimatedDays ? parseInt(estimatedDays) : null }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("PATCH ADMIN PRODUCT REQUEST ERROR:", error);
    if ((error as Error).message === "UNAUTHORIZED" || (error as Error).message === "FORBIDDEN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}
