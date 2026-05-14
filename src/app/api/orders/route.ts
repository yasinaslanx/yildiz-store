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

      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + Number(item.variant.price) * item.quantity;
      }, 0);

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = cart.items.map((item) => {
        const variant = item.variant;
        const product = variant.product;

        return {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          brand: product.brand ?? "",
          color: variant.color,
          storage: variant.storage ?? null,
          image: variant.images?.[0]?.url ?? product.images?.[0]?.url ?? "",
          price: new Prisma.Decimal(variant.price),
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
