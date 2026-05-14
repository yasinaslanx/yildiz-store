import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import {
  createPasswordResetToken,
  getPasswordResetExpiry,
} from "@/lib/password-reset";
import { forgotPasswordRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { ZodError } from "zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { getZodErrorMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const { success } = await forgotPasswordRateLimit.limit(`forgot-password:${ip}`);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    
    // Zod validation
    const validatedBody = forgotPasswordSchema.parse(body);

    const email = validatedBody.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kaydınız bulunamadı. Lütfen kayıt olunuz.",
        },
        { status: 404 },
      );
    }

    // Eski kullanılmamış tokenları iptal et
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    const { token, tokenHash } = createPasswordResetToken();

    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: getPasswordResetExpiry(),
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Şifre sıfırlama bağlantınız",
      html: passwordResetEmail({
        firstName: user.firstName,
        resetUrl,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: getZodErrorMessage(error) },
        { status: 400 },
      );
    }

    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { 
        success: false, 
        message: "Şifre sıfırlama isteği oluşturulamadı.",
        debug: (error as Error).message 
      },
      { status: 500 },
    );
  }
}
