import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint: track by order number + phone (no auth required)
export async function POST(req: Request) {
  try {
    const { orderNumber, phone } = await req.json();

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { success: false, message: "Sipariş numarası ve telefon numarası gereklidir." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        customerPhone: phone.trim(),
      },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            brand: true,
            color: true,
            storage: true,
            image: true,
            price: true,
            quantity: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Sipariş bulunamadı. Lütfen sipariş numarası ve telefon numarasını kontrol edin." },
        { status: 404 }
      );
    }

    // Return limited info for public tracking (no personal details)
    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingCarrier: order.shippingCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        shippingCity: order.shippingCity,
        shippingDistrict: order.shippingDistrict,
        totalAmount: Number(order.totalAmount),
        itemCount: order.items.length,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.productName,
          brand: item.brand,
          color: item.color,
          storage: item.storage,
          image: item.image,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      }
    });
  } catch (error) {
    console.error("TRACK ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sorgulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
