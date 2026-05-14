import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { authRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/validations/auth";
import { getZodErrorMessage } from "@/lib/validation";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    
    // Rate limit kontrolü (Redis bağlantı hatasına karşı korumalı)
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes("your-upstash-url")) {
        const { success } = await authRateLimit.limit(`login:${ip}`);
        if (!success) {
          return NextResponse.json(
            {
              success: false,
              message: "Çok fazla giriş denemesi yaptınız. Lütfen biraz bekleyin.",
            },
            { status: 429 },
          );
        }
      }
    } catch (error) {
      console.warn("Rate limit servisine ulaşılamadı, güvenlik kontrolü atlanıyor...");
    }

    const body = await request.json();
    
    // Zod validation
    const validatedBody = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedBody.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "E-posta veya şifre hatalı." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(validatedBody.password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "E-posta veya şifre hatalı." },
        { status: 401 },
      );
    }

    await setSessionCookie({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: getZodErrorMessage(error) },
        { status: 400 },
      );
    }

    Sentry.captureException(error);
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Giriş işlemi başarısız oldu." },
      { status: 500 },
    );
  }
}