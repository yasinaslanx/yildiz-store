import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requirePermission("USERS");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING"; // PENDING, APPROVED, REJECTED

    const applications = await prisma.dealerApplication.findMany({
      where: status !== "ALL" ? { status: status as any } : undefined,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("GET DEALER APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Başvurular alınamadı." },
      { status: 500 }
    );
  }
}
