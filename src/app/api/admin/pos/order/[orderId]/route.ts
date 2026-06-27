import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(req: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    await requireAdminUser();
    const { orderId } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: {
          include: {
            dealerTransactions: {
              where: {
                createdAt: {
                  lte: new Date() // Sadece bu sipariş anına kadar olan işlemler (ya da tümü şimdilik)
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Sipariş bulunamadı." }, { status: 404 });
    }

    // Since variant relation doesn't exist on OrderItem in schema, fetch manually:
    const itemsWithVariants = await Promise.all(order.items.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { sku: true }
      });
      return {
        ...item,
        variant: variant || { sku: "N/A" }
      };
    }));

    const orderToSend = {
      ...order,
      items: itemsWithVariants
    };

    return NextResponse.json({ success: true, order: orderToSend });
  } catch (error) {
    console.error("GET PRINT ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: "Fatura getirilemedi." }, { status: 500 });
  }
}
