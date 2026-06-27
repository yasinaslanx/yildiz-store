import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = await req.json();

    const {
      dealerId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items,
      totalAmountUSD,
      discountAmountUSD,
      deliveryType,
      exchangeRate,
      note,
      paidAmountUSD,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ success: false, message: "Sepet boş." }, { status: 400 });
    }

    // Prepare total TRY based on exchange rate (for Order tracking/reports compatibility)
    const totalAmountTRY = Number(totalAmountUSD) * Number(exchangeRate);
    const orderNumber = `POS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: dealerId || adminUser.id, // Fallback to admin if guest
          customerName: customerName || "Misafir Cari",
          customerEmail: customerEmail || "guest@sunix.com",
          customerPhone: customerPhone || "",
          shippingAddress: shippingAddress || "Merkez Mağaza",
          shippingCity: "Siverek",
          shippingDistrict: "Merkez",
          paymentMethod: "CASH_ON_DELIVERY", // Or maybe a new enum value "LEDGER" later
          paymentStatus: dealerId ? "UNPAID" : "PAID", // If it's a dealer, it's unpaid (debt)
          status: deliveryType === "SHIPPED" ? "SHIPPED" : "DELIVERED",
          totalAmount: new Prisma.Decimal(totalAmountTRY), // Store in TRY for base system
          currency: "USD",
          exchangeRate: new Prisma.Decimal(exchangeRate),
          isWholesalePOS: true,
          deliveryType: deliveryType || "HAND_DELIVERY",
          discountAmount: new Prisma.Decimal(discountAmountUSD || 0),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              brand: item.brand,
              color: item.color,
              storage: item.storage,
              image: item.image,
              price: new Prisma.Decimal(item.finalPriceUSD || item.priceUSD), // Store the final discounted price
              quantity: item.quantity,
            }))
          }
        }
      });

      // 2. Reduce Stock
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          const newStock = Math.max(0, variant.stock - item.quantity);
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newStock }
          });

          // Log stock change
          await tx.stockLog.create({
            data: {
              variantId: variant.id,
              userId: adminUser.id,
              previousStock: variant.stock,
              newStock: newStock,
              change: -item.quantity,
              reason: `Toptan Satış (Sipariş: ${orderNumber})`
            }
          });
        }
      }

      // 3. Add to DealerTransaction (if a dealer is selected)
      if (dealerId) {
        await tx.dealerTransaction.create({
          data: {
            userId: dealerId,
            orderId: order.id,
            type: "DEBT", // Satın aldığı için borçlanıyor
            amount: new Prisma.Decimal(totalAmountUSD),
            currency: "USD",
            description: note || `Toptan Satış Fişi (${orderNumber})`
          }
        });

        if (paidAmountUSD && Number(paidAmountUSD) > 0) {
          await tx.dealerTransaction.create({
            data: {
              userId: dealerId,
              orderId: order.id,
              type: "PAYMENT", // Aynı sipariş esnasında tahsilat alındı
              amount: new Prisma.Decimal(paidAmountUSD),
              currency: "USD",
              description: `Satış Anında Tahsilat (${orderNumber})`
            }
          });
        }
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: result.id, orderNumber: result.orderNumber });
  } catch (error: any) {
    console.error("POS CREATE ORDER ERROR:", error);
    return NextResponse.json({ success: false, message: "Sipariş oluşturulurken hata oluştu.", error: error.message }, { status: 500 });
  }
}
