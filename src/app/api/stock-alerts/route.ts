import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const stockAlertSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  variantId: z.string().min(1, "Varyant ID gerekli."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, variantId } = stockAlertSchema.parse(body);

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    if (variant.stock > 0) {
      return NextResponse.json(
        { success: false, message: "Bu ürün zaten stokta." },
        { status: 400 }
      );
    }

    await prisma.stockAlert.upsert({
      where: {
        email_variantId: {
          email,
          variantId,
        },
      },
      update: { notified: false },
      create: {
        email,
        variantId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stok geldiğinde size haber vereceğiz!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: (error as any).errors[0].message },
        { status: 400 }
      );
    }

    console.error("STOCK ALERT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
