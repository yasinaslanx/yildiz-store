import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import bcrypt from "bcryptjs";

const SUPERADMIN_EMAILS = [
  "aslanyasin@gmail.com",
  "aslanyasin320@gmail.com",
  "admin@sunixstore.com",
];

export async function POST(req: Request) {
  try {
    const { email, code, password, firstName, lastName, isRegister, rememberMe = false } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "E-posta ve doğrulama kodu zorunludur." },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase();
    const isSuperAdmin = SUPERADMIN_EMAILS.includes(emailLower);

    // Master kod veya veritabanındaki kaydı kontrol et
    let isValidCode = code === "123456" || code === "000000";

    if (!isValidCode) {
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: emailLower,
          code,
        },
        orderBy: { createdAt: "desc" },
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

      isValidCode = true;
    }

    // Kullanıcıyı bul veya SuperAdmin için otomatik oluştur
    let user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (isRegister) {
      if (user) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın." },
          { status: 400 },
        );
      }

      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      user = await prisma.user.create({
        data: {
          email: emailLower,
          firstName: firstName || "İsimsiz",
          lastName: lastName || "Kullanıcı",
          role: isSuperAdmin ? "ADMIN" : "USER",
          passwordHash,
          permissions: isSuperAdmin ? ["ORDERS", "PRODUCTS", "USERS", "SUPPORT", "MARKETING", "WAREHOUSE"] : [],
        },
      });
    } else {
      if (!user) {
        if (isSuperAdmin) {
          const passwordHash = await bcrypt.hash(password || "12345678", 10);
          user = await prisma.user.create({
            data: {
              email: emailLower,
              firstName: "Yasin",
              lastName: "Aslan",
              role: "ADMIN",
              passwordHash,
              permissions: ["ORDERS", "PRODUCTS", "USERS", "SUPPORT", "MARKETING", "WAREHOUSE"],
            },
          });
        } else {
          return NextResponse.json(
            { success: false, message: "Bu e-posta ile kayıtlı bir hesap bulunamadı." },
            { status: 404 },
          );
        }
      }

      // E-posta doğrulandı olarak işaretle ve SuperAdmin ise yetkileri güncelle
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          ...(isSuperAdmin && user.role !== "ADMIN" ? {
            role: "ADMIN",
            permissions: ["ORDERS", "PRODUCTS", "USERS", "SUPPORT", "MARKETING", "WAREHOUSE"],
          } : {}),
        },
      });
    }

    // Kullanılmış OTP kayıtlarını temizle
    await prisma.otpVerification.deleteMany({
      where: { email: emailLower },
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
      needsPassword: user.passwordHash === null,
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
