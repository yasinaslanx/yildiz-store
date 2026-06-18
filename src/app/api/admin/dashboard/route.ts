import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminUser();

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenueResult,
      todayRevenueResult,
      totalUsers,
      lowStockVariants,
      latestOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.order.count({
        where: {
          paymentStatus: "PAID",
        },
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          paymentStatus: "PAID",
        },
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          paymentStatus: "PAID",
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.user.count(),
      prisma.productVariant.findMany({
        where: {
          stock: {
            lte: 5,
          },
          active: true,
        },
        include: {
          product: true,
        },
        orderBy: {
          stock: "asc",
        },
        take: 10,
      }),
      prisma.order.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    const salesByDayMap = new Map<string, number>();
    const revenueByRole = { B2B: 0, B2C: 0 };

    // Initialize last 30 days with 0 revenue
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
      salesByDayMap.set(dateStr, 0);
    }

    thirtyDaysOrders.forEach((order) => {
      const dateStr = order.createdAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
      if (salesByDayMap.has(dateStr)) {
        salesByDayMap.set(dateStr, salesByDayMap.get(dateStr)! + Number(order.totalAmount));
      }

      if (order.user?.role === "DEALER") {
        revenueByRole.B2B += Number(order.totalAmount);
      } else {
        revenueByRole.B2C += Number(order.totalAmount);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          paidOrders,
          totalUsers,
          totalRevenue: Number(totalRevenueResult._sum.totalAmount ?? 0),
          todayRevenue: Number(todayRevenueResult._sum.totalAmount ?? 0),
        },
        chartData: {
          salesTrend: Array.from(salesByDayMap.entries()).map(([date, amount]) => ({
            date,
            amount,
          })),
          revenueDistribution: [
            { name: "Bayi (B2B)", value: revenueByRole.B2B },
            { name: "Perakende (B2C)", value: revenueByRole.B2C },
          ]
        },
        lowStockVariants: lowStockVariants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          color: variant.color,
          storage: variant.storage,
          stock: variant.stock,
          product: {
            id: variant.product.id,
            name: variant.product.name,
            brand: variant.product.brand,
          },
        })),
        latestOrders: latestOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalAmount: Number(order.totalAmount),
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Dashboard verileri alınamadı: " + error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
