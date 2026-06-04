import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cartTotal } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Kupon kodu eksik" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Geçersiz kupon kodu" },
        { status: 404 }
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        { success: false, message: "Bu kupon kodu artık aktif değil" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { success: false, message: "Bu kupon kodunun süresi dolmuş" },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Bu kuponun kullanım limiti dolmuş" },
        { status: 400 }
      );
    }

    // İndirim miktarını hesapla
    let discountAmount = 0;
    const discountValue = Number(coupon.discountValue);
    
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = discountValue;
    }

    // İndirim sepet tutarından büyük olamaz
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountValue,
        discountAmount: discountAmount,
      },
    });
  } catch (error: any) {
    console.error("Kupon doğrulama hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
