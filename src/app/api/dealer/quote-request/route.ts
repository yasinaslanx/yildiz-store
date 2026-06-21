import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";


export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || ((user.role as string) !== "DEALER" && (user.role as string) !== "dealer")) {
      return NextResponse.json(
        { success: false, message: "Sadece bayiler indirim talebinde bulunabilir." },
        { status: 403 }
      );
    }

    const { items, totalAmount } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Sepetiniz boş." },
        { status: 400 }
      );
    }

    // Generate unique order number starting with QT for Quote
    const orderNumber = `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: `${(user as any).firstName || (user as any).name || "Bayi"} ${(user as any).lastName || ""}`.trim(),
        customerEmail: user.email,
        customerPhone: "BAYI-TALEP", // Placeholder
        shippingAddress: "BAYI-TALEP", // Placeholder
        shippingCity: "BAYI-TALEP", // Placeholder
        shippingDistrict: "BAYI-TALEP", // Placeholder
        totalAmount,
        status: "PENDING",
        isQuoteRequest: true,
        quoteStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id, // Depends on how cart item is structured
            variantId: item.variantId || item.id,
            productName: item.productName,
            brand: item.brand || "Bilinmeyen",
            color: item.color,
            storage: item.storage,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Send Telegram Notification
    try {
      const customerName = `${(user as any).firstName || "Bayi"} ${(user as any).lastName || ""}`.trim();
      let telegramMsg = `🚨 *YENİ BAYİ SİPARİŞİ (TALEP) !* 🚨\n\n`;
      telegramMsg += `👤 *Bayi:* ${customerName}\n`;
      telegramMsg += `📧 *Email:* ${user.email}\n`;
      telegramMsg += `💰 *Toplam Tutar:* ${Number(totalAmount).toLocaleString('tr-TR')} ₺\n`;
      telegramMsg += `🛍️ *Ürün Sayısı:* ${items.length} çeşit\n\n`;
      telegramMsg += `📝 *Sipariş Kodu:* \`${orderNumber}\`\n\n`;
      telegramMsg += `_Sisteme giriş yapıp onaylayabilirsiniz._`;
      
      await sendTelegramMessage(telegramMsg);
    } catch (e) {
      console.error("Telegram bildirim hatası", e);
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("QUOTE REQUEST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Talep oluşturulamadı." },
      { status: 500 }
    );
  }
}
