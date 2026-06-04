import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const application = await prisma.dealerApplication.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("GET DEALER APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Başvuru bilgileri alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, taxOffice, taxNumber, phone, address } = body;

    if (!companyName || !taxOffice || !taxNumber || !phone || !address) {
      return NextResponse.json(
        { success: false, message: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    // Kullanıcının daha önceden başvurusu var mı kontrol et
    const existingApp = await prisma.dealerApplication.findUnique({
      where: { userId: user.id },
    });

    if (existingApp) {
      return NextResponse.json(
        { success: false, message: "Zaten mevcut bir başvurunuz bulunuyor." },
        { status: 400 }
      );
    }

    const newApp = await prisma.dealerApplication.create({
      data: {
        userId: user.id,
        companyName,
        taxOffice,
        taxNumber,
        phone,
        address,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Başvurunuz başarıyla alındı.",
      data: newApp,
    });
  } catch (error) {
    console.error("POST DEALER APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Başvuru kaydedilemedi." },
      { status: 500 }
    );
  }
}
