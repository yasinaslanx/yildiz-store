import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Lütfen tüm alanları doldurun." },
        { status: 400 },
      );
    }

    const emailLower = email.trim().toLowerCase();

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Şifre en az 8 karakter olmalıdır." },
        { status: 400 },
      );
    }

    // Kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Bu e-posta adresi zaten kullanımda." },
        { status: 400 },
      );
    }

    // Şifreyi hash'le
    const passwordHash = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur (varsayılan olarak isEmailVerified: false)
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailLower,
        passwordHash,
        role: "USER",
        isEmailVerified: false,
      },
    });

    // Oturum Çerezini Ayarla
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as "USER" | "ADMIN" | "DEALER",
      permissions: user.permissions || [],
    };

    await setSessionCookie(sessionUser, false);

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      needsPassword: false,
    };

    return NextResponse.json({
      success: true,
      message: "Kayıt işlemi başarıyla tamamlandı.",
      data: safeUser,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kayıt sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
