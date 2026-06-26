import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await req.json();
    const { active, minQuantity, specialPrice, title, expiresAt } = body;

    const data: any = {};
    if (active !== undefined) data.active = active;
    if (minQuantity !== undefined) data.minQuantity = parseInt(minQuantity);
    if (specialPrice !== undefined) data.specialPrice = parseFloat(specialPrice);
    if (title !== undefined) data.title = title;
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const offer = await prisma.dealerOffer.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error("Error updating dealer offer:", error);
    return NextResponse.json({ success: false, message: "Teklif güncellenirken bir hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser();
    const { id } = await params;

    await prisma.dealerOffer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Teklif başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting dealer offer:", error);
    return NextResponse.json({ success: false, message: "Teklif silinirken bir hata oluştu" }, { status: 500 });
  }
}
