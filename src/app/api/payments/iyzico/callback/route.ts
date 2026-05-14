import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { iyzipay, Iyzipay } from "@/lib/iyzico";
import { sendEmail } from "@/lib/email";
import { paymentSuccessEmail } from "@/lib/email-templates";

function callRetrieveCheckoutForm(request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(request, (err: unknown, result: any) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token") ?? "");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail?reason=missing-token`,
      );
    }

    const result = await callRetrieveCheckoutForm({
      locale: Iyzipay.LOCALE.TR,
      token,
    });

    const orderId = result.basketId as string | undefined;

    if (!orderId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail?reason=missing-order`,
      );
    }

    const isSuccess =
      result.status === "success" && result.paymentStatus === "SUCCESS";

    await prisma.payment.upsert({
      where: {
        orderId,
      },
      update: {
        provider: "IYZICO",
        status: isSuccess ? "PAID" : "FAILED",
        transactionId: result.paymentId ?? null,
        conversationId: result.conversationId ?? null,
        rawResponse: result as any,
        paidAt: isSuccess ? new Date() : null,
      },
      create: {
        orderId,
        provider: "IYZICO",
        status: isSuccess ? "PAID" : "FAILED",
        transactionId: result.paymentId ?? null,
        conversationId: result.conversationId ?? null,
        rawResponse: result as any,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: isSuccess ? "PAID" : "FAILED",
        status: isSuccess ? "CONFIRMED" : "PENDING",
      },
      include: {
        items: true,
      },
    });

    if (isSuccess) {
      await sendEmail({
        to: updatedOrder.customerEmail,
        subject: `Ödemeniz başarılı - ${updatedOrder.orderNumber}`,
        html: paymentSuccessEmail({
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.customerName,
          totalAmount: Number(updatedOrder.totalAmount),
          items: updatedOrder.items.map((item) => ({
            productName: item.productName,
            brand: item.brand,
            color: item.color,
            storage: item.storage,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        }),
      });
    }

    if (isSuccess) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?orderId=${orderId}`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail?orderId=${orderId}`,
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error("IYZICO CALLBACK ERROR:", error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail?reason=server-error`,
    );
  }
}
