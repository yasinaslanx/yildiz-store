import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatOrder(order: any) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: Number(order.totalAmount),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingDistrict: order.shippingDistrict,
    shippingPostalCode: order.shippingPostalCode,
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      brand: item.brand,
      color: item.color,
      storage: item.storage,
      image: item.image,
      price: Number(item.price),
      quantity: item.quantity,
      total: Number(item.price) * item.quantity,
    })),
  };
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { orderId } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Sipariş bulunamadı." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: formatOrder(order),
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("GET ORDER DETAIL ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sipariş detayı alınamadı." },
      { status: 500 },
    );
  }
}
