import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { orderCreatedEmail } from "@/lib/email-templates";
import { checkoutRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { ZodError } from "zod";
import { createOrderSchema } from "@/lib/validations/order";
import { getZodErrorMessage } from "@/lib/validation";

// ... formatOrder and generateOrderNumber functions remain same ...
function formatOrder(order: Record<string, unknown>) {
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
    items: (Array.isArray(order.items) ? order.items : []).map((item: Record<string, unknown>) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      brand: item.brand,
      color: item.color,
      storage: item.storage,
      image: item.image,
      price: Number(item.price),
      quantity: Number(item.quantity),
      total: Number(item.price) * Number(item.quantity),
    })),
  };
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = now
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();

  return `${datePart}${randomPart}`;
}

export async function GET() {
  try {
    const user = await requireSessionUser();

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: orders.map(formatOrder),
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Siparişler alınamadı." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request);
    const { success } = await checkoutRateLimit.limit(`checkout:${ip}`);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Çok fazla sipariş denemesi yaptınız.",
        },
        { status: 429 },
      );
    }

    const user = await requireSessionUser();
    const body = await request.json();
    
    // Zod validation
    const validatedBody = createOrderSchema.parse(body);

    const paymentMethod = validatedBody.paymentMethod ?? "CASH_ON_DELIVERY";

    const createdOrder = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  images: true,
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("EMPTY_CART");
      }

      for (const item of cart.items) {
        if (!item.variant.active || !item.variant.product.active) {
          throw new Error("INACTIVE_PRODUCT");
        }

        if (item.variant.stock < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${item.variant.product.name}`);
        }
      }

      const isDealer = user.role === "DEALER";

      let totalAmount = cart.items.reduce((sum, item) => {
        const price = isDealer && item.variant.wholesalePrice ? Number(item.variant.wholesalePrice) : Number(item.variant.price);
        return sum + price * item.quantity;
      }, 0);

      let appliedCoupon = null;
      let discountAmount = 0;

      if (validatedBody.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: validatedBody.couponCode.toUpperCase() },
        });

        if (coupon && coupon.active && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
          appliedCoupon = coupon;
          const discountValue = Number(coupon.discountValue);
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (totalAmount * discountValue) / 100;
          } else if (coupon.discountType === "FIXED") {
            discountAmount = discountValue;
          }
          if (discountAmount > totalAmount) discountAmount = totalAmount;
          totalAmount = Math.max(0, totalAmount - discountAmount);
        }
      }

      const dbUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!dbUser) throw new Error("USER_NOT_FOUND");

      if (paymentMethod === "OPEN_ACCOUNT") {
        const currentDebt = Number(dbUser.currentDebt || 0);
        const creditLimit = Number(dbUser.creditLimit || 0);
        if (currentDebt + totalAmount > creditLimit) {
          throw new Error(`CREDIT_LIMIT_EXCEEDED:${creditLimit}:${currentDebt}`);
        }
      }

      let spentPoints = 0;
      if (validatedBody.usePoints && dbUser.points > 0) {
        spentPoints = Math.min(dbUser.points, Math.floor(totalAmount));
        totalAmount = Math.max(0, totalAmount - spentPoints);
      }
      
      const earnedPoints = Math.floor(totalAmount / 100); // Her 100 TL için 1 Puan

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = cart.items.map((item) => {
        const variant = item.variant;
        const product = variant.product;

        const price = isDealer && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);

        return {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          brand: product.brand ?? "",
          color: variant.color,
          storage: variant.storage ?? null,
          image: variant.images?.[0]?.url ?? product.images?.[0]?.url ?? "",
          price: new Prisma.Decimal(price),
          quantity: item.quantity,
        };
      });

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,

          customerName: validatedBody.customerName.trim(),
          customerEmail: validatedBody.customerEmail.trim().toLowerCase(),
          customerPhone: validatedBody.customerPhone.trim(),

          shippingAddress: validatedBody.shippingAddress.trim(),
          shippingCity: validatedBody.shippingCity.trim(),
          shippingDistrict: validatedBody.shippingDistrict.trim(),
          shippingPostalCode: validatedBody.shippingPostalCode?.trim() || null,

          paymentMethod,
          paymentStatus: paymentMethod === "CREDIT_CARD" ? "PENDING" : "UNPAID",
          status: "PENDING",
          totalAmount: new Prisma.Decimal(totalAmount),
          earnedPoints,
          spentPoints,
          currency: validatedBody.currency || "TRY",
          exchangeRate: validatedBody.exchangeRate ? new Prisma.Decimal(validatedBody.exchangeRate) : null,

          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (paymentMethod === "OPEN_ACCOUNT") {
        await tx.user.update({
          where: { id: user.id },
          data: {
            currentDebt: {
              increment: new Prisma.Decimal(totalAmount),
            },
          },
        });
      }

      if (spentPoints > 0 || earnedPoints > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            points: {
              decrement: spentPoints,
              increment: earnedPoints,
            },
          },
        });
      }

      return order;
    });

    await sendEmail({
      to: createdOrder.customerEmail,
      subject: `Siparişiniz alındı - ${createdOrder.orderNumber}`,
      html: orderCreatedEmail({
        orderNumber: createdOrder.orderNumber,
        customerName: createdOrder.customerName,
        totalAmount: Number(createdOrder.totalAmount),
        items: createdOrder.items.map((item) => ({
          productName: item.productName,
          brand: item.brand,
          color: item.color,
          storage: item.storage,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }),
    });

    return NextResponse.json(
      {
        success: true,
        data: formatOrder(createdOrder),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: getZodErrorMessage(error) },
        { status: 400 },
      );
    }

    if ((error as Error).message.startsWith("CREDIT_LIMIT_EXCEEDED:")) {
      const parts = (error as Error).message.split(":");
      const limit = Number(parts[1] || 0).toLocaleString("tr-TR");
      const debt = Number(parts[2] || 0).toLocaleString("tr-TR");
      return NextResponse.json(
        { success: false, message: `Kredi limitiniz aşıldı! Limit: ${limit} ₺, Mevcut Borç: ${debt} ₺. Lütfen ödeme yönteminizi değiştirin veya açık hesap bakiyenizi kapatın.` },
        { status: 400 },
      );
    }

    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Giriş yapmanız gerekiyor." },
        { status: 401 },
      );
    }

    if ((error as Error).message === "EMPTY_CART") {
      return NextResponse.json(
        { success: false, message: "Sepetiniz boş." },
        { status: 400 },
      );
    }

    if ((error as Error).message === "INACTIVE_PRODUCT") {
      return NextResponse.json(
        { success: false, message: "Sepetinizde satışta olmayan ürün var." },
        { status: 409 },
      );
    }

    if ((error as Error).message.startsWith("OUT_OF_STOCK:")) {
      const productName = (error as Error).message.split(":")[1];

      return NextResponse.json(
        { success: false, message: `${productName} için yeterli stok yok.` },
        { status: 409 },
      );
    }

    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Sipariş oluşturulamadı." },
      { status: 500 },
    );
  }
}
