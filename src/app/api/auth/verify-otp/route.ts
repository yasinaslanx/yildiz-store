import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, code, firstName, lastName, isRegister, rememberMe = false } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "E-posta ve doğrulama kodu zorunludur." },
        { status: 400 },
      );
    }

    // Geçerli OTP'yi bul
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Geçersiz doğrulama kodu." },
        { status: 400 },
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { success: false, message: "Doğrulama kodunun süresi dolmuş." },
        { status: 400 },
      );
    }

    // Kullanıcıyı bul
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    const isAdmin = email.toLowerCase() === "admin@sunixstore.com" || email.toLowerCase() === "aslanyasin320@gmail.com";

    if (isRegister) {
      if (user) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın." },
          { status: 400 },
        );
      }
      
      // Kullanıcıyı oluştur
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName: firstName || "İsimsiz",
          lastName: lastName || "Kullanıcı",
          role: isAdmin ? "ADMIN" : "USER"
        }
      });
    } else {
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta ile kayıtlı bir hesap bulunamadı." },
          { status: 404 },
        );
      }

      // Mevcut kullanıcı admin yetkisine sahip olması gerekiyorsa güncelle
      if (isAdmin && user.role !== "ADMIN") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" }
        });
      }
    }

    // Kullanılmış OTP kayıtlarını temizle
    await prisma.otpVerification.deleteMany({
      where: { email: email.toLowerCase() }
    });

    // Oturum (Session) Çerezini Ayarla
    const sessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as "USER" | "ADMIN" | "DEALER",
      permissions: user.permissions || [],
    };

    await setSessionCookie(sessionUser, rememberMe);

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    return NextResponse.json({
      success: true,
      message: isRegister ? "Kayıt işlemi başarılı." : "Giriş başarılı.",
      data: safeUser,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
