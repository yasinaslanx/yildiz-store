import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

function generateReturnNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
  return `RET-${datePart}-${randomPart}`;
}

export async function GET() {
  try {
    const user = await requireSessionUser();

    const returns = await prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            totalAmount: true,
          },
        },
        items: {
          include: {
            orderItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: returns.map((ret) => ({
        id: ret.id,
        returnNumber: ret.returnNumber,
        orderId: ret.orderId,
        orderNumber: ret.order.orderNumber,
        type: ret.type,
        status: ret.status,
        reason: ret.reason,
        explanation: ret.explanation,
        images: ret.images,
        cargoCarrier: ret.cargoCarrier,
        cargoCode: ret.cargoCode,
        adminNote: ret.adminNote,
        refundAmount: ret.refundAmount ? Number(ret.refundAmount) : null,
        createdAt: ret.createdAt,
        items: ret.items.map((item) => ({
          id: item.id,
          productName: item.orderItem.productName,
          brand: item.orderItem.brand,
          color: item.orderItem.color,
          storage: item.orderItem.storage,
          image: item.orderItem.image,
          price: Number(item.orderItem.price),
          quantity: item.quantity,
        })),
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }
    console.error("GET RETURNS ERROR:", error);
    return NextResponse.json({ success: false, message: "İade talepleri alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();

    const { orderId, type, reason, explanation, images, items } = body;

    if (!orderId || !explanation || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lütfen gerekli tüm alanları ve iade edilecek ürünleri seçin." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Sipariş bulunamadı." }, { status: 404 });
    }

    // Sipariş 'DELIVERED' veya en azından teslim alınmış olmalı
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { success: false, message: "Sadece teslim edilen siparişler için iade/değişim talebi oluşturulabilir." },
        { status: 400 },
      );
    }

    // Seçilen ürünlerin sipariş içerisinde olup olmadığını ve miktarlarını doğrula
    const returnItemsData: { orderItemId: string; quantity: number }[] = [];

    for (const item of items) {
      const existingOrderItem = order.items.find((i) => i.id === item.orderItemId);
      if (!existingOrderItem) {
        return NextResponse.json(
          { success: false, message: "Sarişte bulunmayan bir ürün iade edilemez." },
          { status: 400 },
        );
      }
      const qty = Math.min(Math.max(1, Number(item.quantity) || 1), existingOrderItem.quantity);
      returnItemsData.push({
        orderItemId: existingOrderItem.id,
        quantity: qty,
      });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        returnNumber: generateReturnNumber(),
        orderId: order.id,
        userId: user.id,
        type: type === "EXCHANGE" ? "EXCHANGE" : "RETURN",
        reason: reason || "DEFECTIVE",
        explanation: explanation.trim(),
        images: Array.isArray(images) ? images : [],
        status: "PENDING",
        items: {
          create: returnItemsData,
        },
      },
      include: {
        items: {
          include: {
            orderItem: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: returnRequest,
        message: "İade/Değişim talebiniz başarıyla alındı.",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }
    console.error("CREATE RETURN REQUEST ERROR:", error);
    return NextResponse.json({ success: false, message: "Talebiniz oluşturulamadı." }, { status: 500 });
  }
}
