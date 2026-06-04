import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminUser();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kuponlar alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const { code, discountType, discountValue, active, usageLimit, expiresAt } = body;

    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Bu kupon kodu zaten mevcut." },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        active,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kupon oluşturulamadı." },
      { status: 500 }
    );
  }
}
