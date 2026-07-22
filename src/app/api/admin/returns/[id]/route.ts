import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await request.json();

    const { status, cargoCarrier, cargoCode, adminNote, refundAmount } = body;

    const returnReq = await prisma.returnRequest.findUnique({
      where: { id },
    });

    if (!returnReq) {
      return NextResponse.json({ success: false, message: "İade talebi bulunamadı." }, { status: 404 });
    }

    const updateData: Prisma.ReturnRequestUpdateInput = {};
    if (status) updateData.status = status;
    if (cargoCarrier !== undefined) updateData.cargoCarrier = cargoCarrier;
    if (cargoCode !== undefined) updateData.cargoCode = cargoCode;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (refundAmount !== undefined && refundAmount !== null) {
      updateData.refundAmount = new Prisma.Decimal(refundAmount);
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedReturn,
      message: "İade talebi başarıyla güncellendi.",
    });
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 403 });
    }
    console.error("UPDATE ADMIN RETURN ERROR:", error);
    return NextResponse.json({ success: false, message: "İade güncellenemedi." }, { status: 500 });
  }
}
