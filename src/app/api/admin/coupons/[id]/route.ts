import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await request.json();
    const { code, discountType, discountValue, active, usageLimit, expiresAt } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
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
    console.error("UPDATE COUPON ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kupon güncellenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Kupon silinemedi." },
      { status: 500 }
    );
  }
}
