import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { active, minQuantity, specialPrice, title } = body;

    const data: any = {};
    if (active !== undefined) data.active = active;
    if (minQuantity !== undefined) data.minQuantity = parseInt(minQuantity);
    if (specialPrice !== undefined) data.specialPrice = parseFloat(specialPrice);
    if (title !== undefined) data.title = title;

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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.dealerOffer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Teklif başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting dealer offer:", error);
    return NextResponse.json({ success: false, message: "Teklif silinirken bir hata oluştu" }, { status: 500 });
  }
}
