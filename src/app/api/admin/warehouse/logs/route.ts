import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requirePermission("WAREHOUSE");

    // Sadece son 50 logu getiriyoruz, performans için
    const logs = await prisma.stockLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        variant: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("GET STOCK LOGS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Loglar alınamadı." },
      { status: 500 }
    );
  }
}
