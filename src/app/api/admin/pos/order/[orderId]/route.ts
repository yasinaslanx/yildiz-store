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
        items: {
          include: {
            variant: {
              select: { sku: true }
            }
          }
        },
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

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("GET PRINT ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: "Fatura getirilemedi." }, { status: 500 });
  }
}
