import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { iyzipay, Iyzipay } from "@/lib/iyzico";

type Body = {
  orderId: string;
};

function callInitializeCheckoutForm(request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: unknown, result: any) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as Body;

    if (!body.orderId) {
      return NextResponse.json(
        { success: false, message: "orderId gerekli." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: body.orderId,
        userId: user.id,
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Sipariş bulunamadı." },
        { status: 404 },
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Bu sipariş zaten ödenmiş." },
        { status: 409 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const paidPrice = Number(order.totalAmount).toFixed(2);

    const payment = await prisma.payment.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        provider: "IYZICO",
        status: "PENDING",
      },
      create: {
        orderId: order.id,
        provider: "IYZICO",
        status: "PENDING",
      },
    });

    const iyzicoRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: payment.id,
      price: paidPrice,
      paidPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: order.id,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${siteUrl}/api/payments/iyzico/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],

      buyer: {
        id: user.id,
        name: order.customerName.trim().split(" ")[0] || "Musteri",
        surname: order.customerName.trim().split(" ").slice(1).join(" ") || "Soyad",
        gsmNumber: order.customerPhone,
        email: order.customerEmail,
        identityNumber: "11111111111",
        registrationAddress: order.shippingAddress,
        ip: request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1",
        city: order.shippingCity,
        country: "Turkey",
        zipCode: order.shippingPostalCode ?? "34000",
      },

      shippingAddress: {
        contactName: order.customerName,
        city: order.shippingCity,
        country: "Turkey",
        address: order.shippingAddress,
        zipCode: order.shippingPostalCode ?? "34000",
      },

      billingAddress: {
        contactName: order.customerName,
        city: order.shippingCity,
        country: "Turkey",
        address: order.shippingAddress,
        zipCode: order.shippingPostalCode ?? "34000",
      },

      basketItems: order.items.map((item) => ({
        id: item.id,
        name: item.productName,
        category1: item.brand || "Genel",
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: (Number(item.price) * item.quantity).toFixed(2),
      })),
    };

    const result = await callInitializeCheckoutForm(iyzicoRequest);

    if (result.status !== "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          rawResponse: result as any,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: result.errorMessage || "Ödeme başlatılamadı.",
          data: result,
        },
        { status: 400 },
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        conversationId: result.conversationId,
        rawResponse: result as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentPageUrl: result.paymentPageUrl,
        token: result.token,
      },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("IYZICO START ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ödeme başlatılamadı." },
      { status: 500 },
    );
  }
}
