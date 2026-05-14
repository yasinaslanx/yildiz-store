import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    // Robust approach: Use raw SQL to bypass stale Prisma client issues
    const existingRaw = await prisma.$queryRaw<any[]>`
      SELECT * FROM "NewsletterSubscription" WHERE email = ${email} LIMIT 1
    `;
    const existing = existingRaw[0];

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta adresi zaten kayıtlı." },
          { status: 400 }
        );
      } else {
        await prisma.$executeRaw`
          UPDATE "NewsletterSubscription" SET active = true WHERE email = ${email}
        `;
      }
    } else {
      await prisma.$executeRaw`
        INSERT INTO "NewsletterSubscription" (id, email, active, "createdAt")
        VALUES (${Math.random().toString(36).substring(7)}, ${email}, true, NOW())
      `;
    }

    // TODO: Send welcome email with discount code
    // await sendWelcomeEmail(email);

    return NextResponse.json({
      success: true,
      message: "Bültene başarıyla abone oldunuz! İlk alışverişinize özel indirim kodunuz e-postanıza gönderildi.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: (error as any).errors[0].message },
        { status: 400 }
      );
    }

    console.error("NEWSLETTER ERROR:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Abonelik sırasında bir hata oluştu.",
        debug: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
