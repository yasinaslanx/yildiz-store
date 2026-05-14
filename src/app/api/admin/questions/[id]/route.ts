import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// Soruyu cevapla veya durumunu güncelle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { answer, status } = body;

    const updatedQuestion = await (prisma as any).productQuestion.update({
      where: { id },
      data: {
        answer,
        status: status || (answer ? "ANSWERED" : "PENDING"),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Soru güncellendi.",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("ADMIN QUESTION UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Soru güncellenemedi." },
      { status: 500 }
    );
  }
}

// Soruyu sil
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    await (prisma as any).productQuestion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Soru silindi.",
    });
  } catch (error) {
    console.error("ADMIN QUESTION DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Soru silinemedi." },
      { status: 500 }
    );
  }
}
