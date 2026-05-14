import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    const questions = await (prisma as any).productQuestion.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("ADMIN QUESTIONS GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sorular yüklenemedi." },
      { status: 500 }
    );
  }
}
