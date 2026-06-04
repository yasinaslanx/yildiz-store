import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { points: true } as any
    });

    return NextResponse.json({
      success: true,
      points: (dbUser as any)?.points || 0
    });
  } catch (error) {
    console.error("GET POINTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Puan bilgisi alınamadı." },
      { status: 500 }
    );
  }
}
