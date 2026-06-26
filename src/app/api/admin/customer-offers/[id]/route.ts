import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const { productId, specialPrice, active, title, expiresAt } = data;

    const offer = await prisma.customerOffer.update({
      where: { id },
      data: {
        productId,
        specialPrice: parseFloat(specialPrice),
        active: active ?? true,
        title: title || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error("Failed to update customer offer", error);
    return NextResponse.json({ success: false, message: "Teklif güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.customerOffer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Teklif silindi" });
  } catch (error) {
    console.error("Failed to delete customer offer", error);
    return NextResponse.json({ success: false, message: "Teklif silinemedi" }, { status: 500 });
  }
}
