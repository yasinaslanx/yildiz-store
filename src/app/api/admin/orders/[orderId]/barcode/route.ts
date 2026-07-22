import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdminUser();
    const { orderId } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Sipariş bulunamadı." }, { status: 404 });
    }

    const carrier = order.shippingCarrier || "Yurtiçi Kargo";
    const trackingCode = order.trackingNumber || `SNX-${order.orderNumber}`;

    // Printable A6 Shipping Label HTML Response
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Kargo Etiketi - #${order.orderNumber}</title>
        <style>
          @page { size: A6 portrait; margin: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 16px; background: #fff; color: #000; font-size: 12px; }
          .label-card { border: 2px solid #000; border-radius: 12px; padding: 16px; box-sizing: border-box; height: 96%; display: flex; flex-col; flex-direction: column; justify-content: space-between; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 12px; }
          .logo { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
          .carrier { background: #000; color: #fff; font-weight: 900; padding: 4px 8px; border-radius: 6px; font-size: 12px; text-transform: uppercase; }
          .section { border-bottom: 1px solid #ddd; padding: 10px 0; }
          .title { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 4px; }
          .bold { font-weight: 800; font-size: 13px; }
          .barcode-box { text-align: center; margin: 16px 0; padding: 12px; border: 1px dashed #000; border-radius: 8px; background: #fafafa; }
          .barcode { font-family: "Courier New", monospace; font-size: 24px; font-weight: 900; letter-spacing: 4px; }
          .footer { font-size: 9px; text-align: center; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
          <button onclick="window.print()" style="background: #000; color: #fff; border: none; padding: 10px 20px; font-weight: 900; border-radius: 8px; cursor: pointer;">
            🖨️ Kargo Etiketini Yazdır (A6)
          </button>
        </div>

        <div class="label-card">
          <div class="header">
            <div class="logo">SUNIX STORE</div>
            <div class="carrier">${carrier}</div>
          </div>

          <div class="barcode-box">
            <div class="title">KARGO BARKOD / TAKİP KODU</div>
            <div class="barcode">||| | |||| | ||| |||| |</div>
            <div style="font-weight: 900; font-size: 16px; margin-top: 4px;">${trackingCode}</div>
          </div>

          <div class="section">
            <div class="title">ALICI BİLGİLERİ</div>
            <div class="bold">${order.customerName}</div>
            <div>Telefon: ${order.customerPhone}</div>
            <div style="margin-top: 4px; font-size: 11px;">
              ${order.shippingAddress}<br>
              <strong>${order.shippingDistrict} / ${order.shippingCity}</strong> ${order.shippingPostalCode || ''}
            </div>
          </div>

          <div class="section">
            <div class="title">GÖNDERİCİ BİLGİLERİ</div>
            <div class="bold">Sunix B2B Lojistik Merkezi</div>
            <div>İkitelli Organize Sanayi Bölgesi, İstanbul</div>
          </div>

          <div class="section">
            <div class="title">PAKET İÇERİĞİ (${order.items.length} Kalem)</div>
            <div style="font-size: 10px; color: #333;">
              ${order.items.map(i => `${i.quantity}x ${i.productName} (${i.color})`).join(", ")}
            </div>
          </div>

          <div class="footer">
            SİPARİŞ NO: #${order.orderNumber} • ${new Date(order.createdAt).toLocaleDateString("tr-TR")}
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("GET CARGO BARCODE ERROR:", error);
    return NextResponse.json({ success: false, message: "Barkod üretilemedi." }, { status: 500 });
  }
}
