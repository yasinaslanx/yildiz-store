import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "E-posta adresi zorunludur." },
        { status: 400 },
      );
    }

    // 6 Haneli rastgele kod üretimi
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 dakika geçerli

    // Veritabanına kaydet
    await prisma.otpVerification.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    });

    // E-posta gönderimi
    await sendOtpEmail(email, code);

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
