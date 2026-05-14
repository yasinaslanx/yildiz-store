import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// Ürün sorularını listele (Cevaplanmış olanlar)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const questions = await (prisma as any).productQuestion.findMany({
      where: {
        product: { slug },
        status: "ANSWERED",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("QUESTIONS GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sorular yüklenemedi." },
      { status: 500 }
    );
  }
}

// Soru sor
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Soru sormak için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question || question.length < 10) {
      return NextResponse.json(
        { success: false, message: "Soru en az 10 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    const newQuestion = await (prisma as any).productQuestion.create({
      data: {
        userId: session.id,
        productId: product.id,
        question,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sorunuz başarıyla iletildi. Admin onayından sonra yayınlanacaktır.",
      data: newQuestion,
    });
  } catch (error) {
    console.error("QUESTION POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Soru iletilemedi." },
      { status: 500 }
    );
  }
}
