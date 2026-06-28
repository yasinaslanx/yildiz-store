import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all | debt | paid
    const hideZero = searchParams.get("hideZero") === "true";

    // Tüm POS siparişlerini getir (isWholesalePOS = true)
    const orders = await prisma.order.findMany({
      where: {
        isWholesalePOS: true,
        ...(search
          ? {
              OR: [
                { customerName: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search } },
                { orderNumber: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dealerTransactions: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Her sipariş için net bakiye hesapla (bu siparişe ait borç - yapılan ödemeler)
    const invoices = orders.map((order) => {
      const txs = order.user?.dealerTransactions || [];

      // Bu siparişe ait borç kaydı
      const orderDebt = txs.find(
        (t) => t.orderId === order.id && t.type === "DEBT"
      );
      const debtAmount = orderDebt ? Number(orderDebt.amount) : 0;

      // Bu siparişten sonra yapılan ödemeler (tüm cari ödemeler birikimli - karmaşık olmayalım,
      // sipariş anında veya sonrasında "Satış Anında Tahsilat" veya orderId bağlı PAYMENT kaydı)
      const relatedPayments = txs.filter(
        (t) => t.orderId === order.id && t.type === "PAYMENT"
      );
      const paidAmount = relatedPayments.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const remainingDebt = Math.max(0, debtAmount - paidAmount);
      const totalUSD =
        order.items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0
        ) - Number(order.discountAmount);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        deliveryType: order.deliveryType,
        totalUSD,
        discountAmount: Number(order.discountAmount),
        debtAmount,
        paidAmount,
        remainingDebt,
        isPaid: remainingDebt <= 0,
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          brand: item.brand,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        dealer: order.user
          ? {
              id: order.user.id,
              name: `${order.user.firstName} ${order.user.lastName}`.trim(),
              email: order.user.email,
              phone: order.user.phone,
            }
          : null,
        transactions: txs
          .filter((t) => t.orderId === order.id)
          .map((t) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            description: t.description,
            createdAt: t.createdAt,
          })),
      };
    });

    // Filtrele
    let filtered = invoices;

    if (hideZero) {
      filtered = filtered.filter((inv) => inv.totalUSD > 0);
    }

    if (status === "debt") {
      filtered = filtered.filter((inv) => inv.remainingDebt > 0);
    } else if (status === "paid") {
      filtered = filtered.filter((inv) => inv.isPaid);
    }

    // Özet istatistikler
    const totalDebt = invoices.reduce((sum, inv) => sum + inv.remainingDebt, 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalInvoices = invoices.length;
    const unpaidCount = invoices.filter((inv) => !inv.isPaid).length;

    return NextResponse.json({
      success: true,
      invoices: filtered,
      stats: { totalDebt, totalRevenue, totalInvoices, unpaidCount },
    });
  } catch (error) {
    console.error("GET INVOICES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Faturalar getirilemedi." },
      { status: 500 }
    );
  }
}
