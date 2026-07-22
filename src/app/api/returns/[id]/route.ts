import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { id } = await params;

    const returnReq = await prisma.returnRequest.findFirst({
      where: { id, userId: user.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            totalAmount: true,
            shippingAddress: true,
            shippingCity: true,
            shippingDistrict: true,
          },
        },
        items: {
          include: {
            orderItem: true,
          },
        },
      },
    });

    if (!returnReq) {
      return NextResponse.json({ success: false, message: "İade talebi bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: returnReq.id,
        returnNumber: returnReq.returnNumber,
        orderId: returnReq.orderId,
        orderNumber: returnReq.order.orderNumber,
        orderDate: returnReq.order.createdAt,
        type: returnReq.type,
        status: returnReq.status,
        reason: returnReq.reason,
        explanation: returnReq.explanation,
        images: returnReq.images,
        cargoCarrier: returnReq.cargoCarrier,
        cargoCode: returnReq.cargoCode,
        adminNote: returnReq.adminNote,
        refundAmount: returnReq.refundAmount ? Number(returnReq.refundAmount) : null,
        createdAt: returnReq.createdAt,
        updatedAt: returnReq.updatedAt,
        items: returnReq.items.map((item) => ({
          id: item.id,
          productName: item.orderItem.productName,
          brand: item.orderItem.brand,
          color: item.orderItem.color,
          storage: item.orderItem.storage,
          image: item.orderItem.image,
          price: Number(item.orderItem.price),
          quantity: item.quantity,
        })),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }
    console.error("GET RETURN DETAIL ERROR:", error);
    return NextResponse.json({ success: false, message: "İade detayları alınamadı." }, { status: 500 });
  }
}
