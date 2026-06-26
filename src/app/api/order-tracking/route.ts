import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body;

    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, message: "Sipariş numarası ve e-posta zorunludur." },
        { status: 400 }
      );
    }

    // Siparişi veritabanında ara (Sipariş numarası ve müşteri e-postası tam eşleşmeli)
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        customerEmail: email.trim().toLowerCase(),
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Girdiğiniz bilgilere ait sipariş bulunamadı. Bilgileri kontrol edip tekrar deneyin." },
        { status: 404 }
      );
    }

    // İstenilen verileri filtreleyerek dön (Güvenlik için gereksiz detayları çıkartıyoruz)
    const trackingData = {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      customerName: order.customerName,
      shippingCarrier: order.shippingCarrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        brand: item.brand,
        color: item.color,
        storage: item.storage,
        quantity: item.quantity,
        price: Number(item.price),
        image: item.image,
      })),
    };

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error) {
    console.error("ORDER TRACKING ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sipariş durumu sorgulanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
