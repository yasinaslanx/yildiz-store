import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { sendShippingEmail } from "@/lib/mailer";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

const CARRIER_TRACKING_URLS: Record<string, string> = {
  "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code=",
  "Aras Kargo": "https://kargotakip.araskargo.com.tr/mainpage.aspx?code=",
  "MNG Kargo": "https://www.mngkargo.com.tr/wps/portal/mng/trk/",
  "PTT Kargo": "https://www.ptt.gov.tr/gonderim-sorgulama?sorgulama=",
  "Sürat Kargo": "https://www.suratkargo.com.tr/KargoSorgulama/?Referans=",
  "UPS": "https://www.ups.com/track?tracknum=",
  "DHL": "https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=",
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
    shippingCarrier: order.shippingCarrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
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

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { orderId } = await context.params;

    // Only admin can update orders via this route
    if ((user as any).role !== "ADMIN" && (user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, shippingCarrier, trackingNumber, trackingUrl: customTrackingUrl } = body;

    // Auto-build tracking URL if carrier is known and no custom URL provided
    let trackingUrl = customTrackingUrl;
    if (!trackingUrl && shippingCarrier && trackingNumber && CARRIER_TRACKING_URLS[shippingCarrier]) {
      trackingUrl = CARRIER_TRACKING_URLS[shippingCarrier] + trackingNumber;
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(shippingCarrier !== undefined && { shippingCarrier }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(trackingUrl !== undefined && { trackingUrl }),
      },
      include: { items: true },
    });

    // Send shipping email when status changes to SHIPPED
    if (status === "SHIPPED" && existingOrder.status !== "SHIPPED") {
      try {
        await sendShippingEmail(
          existingOrder.customerEmail,
          existingOrder.customerName,
          existingOrder.orderNumber,
          trackingNumber || existingOrder.trackingNumber || "",
          trackingUrl || existingOrder.trackingUrl || "",
          shippingCarrier || existingOrder.shippingCarrier || ""
        );
      } catch (emailError) {
        console.error("Shipping email error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: formatOrder(updatedOrder),
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    console.error("PATCH ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sipariş güncellenemedi." },
      { status: 500 }
    );
  }
}
