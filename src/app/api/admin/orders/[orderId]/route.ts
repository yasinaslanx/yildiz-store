import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { shippingUpdatedEmail } from "@/lib/email-templates";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

type UpdateOrderBody = {
  status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();

    const { orderId } = await context.params;
    const body = (await request.json()) as UpdateOrderBody;

    if (!body.status && !body.paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Güncellenecek alan gönderilmedi." },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Sipariş bulunamadı." },
        { status: 404 },
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
        ...(body.shippingCarrier !== undefined ? { shippingCarrier: body.shippingCarrier } : {}),
        ...(body.trackingNumber !== undefined ? { trackingNumber: body.trackingNumber } : {}),
        ...(body.trackingUrl !== undefined ? { trackingUrl: body.trackingUrl } : {}),
      },
      include: {
        items: true,
      },
    });

    const shouldSendShippingEmail =
      body.status === "SHIPPED" ||
      body.trackingNumber !== undefined ||
      body.trackingUrl !== undefined;

    if (shouldSendShippingEmail && order.customerEmail) {
      await sendEmail({
        to: order.customerEmail,
        subject: `Siparişiniz kargoya verildi - ${order.orderNumber}`,
        html: shippingUpdatedEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          shippingCarrier: order.shippingCarrier,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    if ((error as Error).message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Bu işlem için yetkiniz yok." },
        { status: 403 },
      );
    }

    console.error("PATCH ADMIN ORDER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sipariş güncellenemedi." },
      { status: 500 },
    );
  }
}
