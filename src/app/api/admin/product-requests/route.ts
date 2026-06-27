import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminUser();

    const requests = await prisma.productRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("GET ADMIN PRODUCT REQUESTS ERROR:", error);
    if ((error as Error).message === "UNAUTHORIZED" || (error as Error).message === "FORBIDDEN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}
