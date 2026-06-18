import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function GET() {
  try {
    await requirePermission("USERS");

    const counts = await prisma.dealerApplication.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const result = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      ALL: 0,
    };

    counts.forEach((item) => {
      result[item.status as keyof typeof result] = item._count.status;
      result.ALL += item._count.status;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET DEALER APPLICATIONS COUNTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sayılar alınamadı." },
      { status: 500 }
    );
  }
}
