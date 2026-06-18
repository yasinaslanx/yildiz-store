import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, setSessionCookie } from "@/lib/session";
import { hashPassword } from "@/lib/auth";

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
    const body = await request.json();
    const { companyName, taxOffice, taxNumber, phone, email, password, address } = body;

    if (!companyName || !taxOffice || !taxNumber || !phone || !password || !address || !email) {
      return NextResponse.json(
        { success: false, message: "Lütfen zorunlu tüm alanları doldurun." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Telefon daha önce kullanılmış mı?
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "Bu telefon numarası ile zaten bir kayıt mevcut." },
        { status: 400 }
      );
    }

    // Email daha önce kullanılmış mı?
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Bu e-posta adresi ile zaten bir kayıt mevcut." },
        { status: 400 }
      );
    }

    // Kullanıcıyı oluştur
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        firstName: companyName.substring(0, 50), // Şirket adını geçici olarak firstName'e yaz
        lastName: "Bayi",
        phone,
        email,
        passwordHash: hashedPassword,
        role: "USER", // Onaylanana kadar USER kalır
      },
    });

    // Başvuruyu oluştur
    const newApp = await prisma.dealerApplication.create({
      data: {
        userId: newUser.id,
        companyName,
        taxOffice,
        taxNumber,
        phone,
        address,
        status: "PENDING",
      },
    });

    // Oturum aç (çerez ayarla) - böylece hemen onay bekliyor ekranını görebilir
    await setSessionCookie({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
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
