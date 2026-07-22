import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.ReturnRequestWhereInput = {};
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumReturnStatusFilter;
    }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const returns = await prisma.returnRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
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
        updatedAt: ret.updatedAt,
        user: ret.user,
        order: {
          id: ret.order.id,
          orderNumber: ret.order.orderNumber,
          totalAmount: Number(ret.order.totalAmount),
          createdAt: ret.order.createdAt,
        },
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
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 403 });
    }
    console.error("GET ADMIN RETURNS ERROR:", error);
    return NextResponse.json({ success: false, message: "İade listesi alınamadı." }, { status: 500 });
  }
}
