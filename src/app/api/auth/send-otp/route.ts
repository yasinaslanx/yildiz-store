import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, isRegister } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "E-posta adresi zorunludur." },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase();
    
    // Sadece giriş işleminde şifre kontrolü yap (Kayıt olurken henüz hesap yok)
    if (!isRegister) {
      const user = await prisma.user.findUnique({ where: { email: emailLower } });
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta adresi ile kayıtlı bir hesap bulunamadı." },
          { status: 404 }
        );
      }

      // Kullanıcının şifresi varsa doğrula
      if (user.passwordHash) {
        if (!password) {
          return NextResponse.json(
            { success: false, message: "Lütfen şifrenizi girin." },
            { status: 400 }
          );
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { success: false, message: "Hatalı şifre girdiniz." },
            { status: 401 }
          );
        }
      }
      // Şifresi yoksa (eski kullanıcı), doğrulamadan geçer (sonra şifre belirlemesini isteyeceğiz)
    }

    // 6 Haneli rastgele kod üretimi
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 dakika geçerli

    // Veritabanına kaydet
    await prisma.otpVerification.create({
      data: {
        email: emailLower,
        code,
        expiresAt,
      },
    });

    // E-posta gönderimi
    await sendOtpEmail(emailLower, code);

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu e-posta adresinize gönderildi.",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kod gönderilirken bir hata oluştu." },
      { status: 500 },
    );
  }
}
