import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { authRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    
    // Rate limit
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes("your-upstash-url")) {
        const { success } = await authRateLimit.limit(`dealerlogin:${ip}`);
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
      console.warn("Rate limit servisine ulaşılamadı, atlanıyor...");
    }

    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
       return NextResponse.json({ success: false, message: "Telefon numarası ve şifre zorunludur." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Telefon numarası veya şifre hatalı." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Telefon numarası veya şifre hatalı." },
        { status: 401 },
      );
    }

    // Set session cookie
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
        phone: user.phone,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("DEALER LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Giriş işlemi başarısız oldu." },
      { status: 500 },
    );
  }
}
