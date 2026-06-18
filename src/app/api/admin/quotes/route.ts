import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL"; // PENDING, APPROVED, REJECTED, ALL

    const quotes = await prisma.order.findMany({
      where: {
        isQuoteRequest: true,
        ...(status !== "ALL" ? { quoteStatus: status } : {}),
      },
      include: {
        items: true,
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
      data: quotes,
    });
  } catch (error) {
    console.error("ADMIN GET QUOTES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Talepler alınamadı." },
      { status: 500 }
    );
  }
}
