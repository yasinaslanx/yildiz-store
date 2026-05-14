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
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Dashboard verileri alınamadı." },
      { status: 500 },
    );
  }
}
