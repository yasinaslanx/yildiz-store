import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CASH_ON_DELIVERY: "Kapıda Ödeme",
    BANK_TRANSFER: "Banka Havalesi",
    CREDIT_CARD: "Kredi Kartı",
  };
  return labels[method] ?? method;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] ?? status;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { orderId } = await context.params;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true },
    });

    if (!order) {
      return new NextResponse("Sipariş bulunamadı.", { status: 404 });
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric"
    });

    const subtotal = order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity, 0
    );
    const kdv = subtotal * 0.20;
    const total = Number(order.totalAmount);

    const itemRows = order.items.map(item => `
      <tr class="item-row">
        <td>
          <div class="item-info">
            ${item.image ? `<img src="${item.image}" alt="${item.productName}" class="item-img" />` : `<div class="item-img-placeholder">📦</div>`}
            <div>
              <div class="item-name">${item.productName}</div>
              <div class="item-meta">${item.brand}${item.color ? ` · ${item.color}` : ""}${item.storage ? ` · ${item.storage}` : ""}</div>
            </div>
          </div>
        </td>
        <td class="text-right">${item.quantity} Adet</td>
        <td class="text-right">${Number(item.price).toLocaleString("tr-TR")} ₺</td>
        <td class="text-right fw-black">${(Number(item.price) * item.quantity).toLocaleString("tr-TR")} ₺</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fatura — #${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Nunito', Arial, sans-serif;
      background: #f5f5f4;
      color: #1c1917;
      padding: 40px 20px;
    }

    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px -10px rgba(0,0,0,0.12);
    }

    /* Header */
    .header {
      background: #1c1917;
      color: #fff;
      padding: 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 44px; height: 44px;
      border: 2px solid #fff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }
    .logo-name {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .invoice-label {
      text-align: right;
    }
    .invoice-label .title {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #a8a29e;
    }
    .invoice-label .number {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -1px;
      margin-top: 6px;
    }
    .invoice-label .date {
      font-size: 12px;
      color: #a8a29e;
      margin-top: 4px;
    }

    /* Info Section */
    .info-section {
      padding: 40px 48px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
      border-bottom: 2px solid #f5f5f4;
    }
    .info-block .label {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #a8a29e;
      margin-bottom: 8px;
    }
    .info-block .value {
      font-size: 13px;
      font-weight: 700;
      color: #1c1917;
      line-height: 1.6;
    }
    .status-badge {
      display: inline-block;
      background: #f5f5f4;
      border: 2px solid #e7e5e4;
      border-radius: 100px;
      padding: 4px 12px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #1c1917;
    }

    /* Table */
    .items-section { padding: 0 48px 40px; }
    .section-title {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #a8a29e;
      padding: 32px 0 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead th {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #a8a29e;
      padding: 12px 0;
      border-bottom: 2px solid #f5f5f4;
      text-align: left;
    }
    thead th.text-right { text-align: right; }
    .item-row td {
      padding: 16px 0;
      border-bottom: 1px solid #f5f5f4;
      font-size: 13px;
      vertical-align: middle;
    }
    .item-row:last-child td { border-bottom: none; }
    .item-info { display: flex; align-items: center; gap: 12px; }
    .item-img { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #f5f5f4; background: #fafaf9; }
    .item-img-placeholder { width: 48px; height: 48px; border-radius: 8px; border: 1px solid #f5f5f4; background: #fafaf9; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .item-name { font-weight: 800; font-size: 13px; text-transform: uppercase; }
    .item-meta { font-size: 10px; color: #a8a29e; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .text-right { text-align: right; }
    .fw-black { font-weight: 900; }

    /* Totals */
    .totals-section {
      margin: 0 48px 40px;
      background: #fafaf9;
      border-radius: 16px;
      padding: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 12px;
    }
    .total-row .key { color: #78716c; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .total-row .val { font-weight: 800; }
    .total-row.grand {
      border-top: 2px solid #e7e5e4;
      margin-top: 12px;
      padding-top: 20px;
    }
    .total-row.grand .key { font-size: 11px; font-weight: 900; color: #1c1917; }
    .total-row.grand .val { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }

    /* Footer */
    .footer {
      background: #fafaf9;
      border-top: 2px solid #f5f5f4;
      padding: 32px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #a8a29e;
    }
    .footer-note {
      font-size: 11px;
      color: #a8a29e;
      font-weight: 700;
    }

    /* Print button */
    .print-bar {
      max-width: 800px;
      margin: 24px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .print-btn {
      background: #1c1917;
      color: #fff;
      border: none;
      border-radius: 100px;
      padding: 14px 28px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      font-family: inherit;
    }
    .print-btn:hover { background: #292524; }

    @media print {
      body { background: #fff; padding: 0; }
      .invoice { box-shadow: none; border-radius: 0; }
      .print-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">🖨️ Yazdır / PDF Olarak Kaydet</button>
  </div>

  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        <div class="logo-icon">★</div>
        <div class="logo-name">Sunix Store</div>
      </div>
      <div class="invoice-label">
        <div class="title">Satış Faturası</div>
        <div class="number">#${order.orderNumber}</div>
        <div class="date">${orderDate}</div>
      </div>
    </div>

    <!-- Info -->
    <div class="info-section">
      <div class="info-block">
        <div class="label">Fatura Kesilen</div>
        <div class="value">
          Sunix Teknoloji<br/>
          Siverek / Şanlıurfa<br/>
          info@sunix.net.tr
        </div>
      </div>
      <div class="info-block">
        <div class="label">Müşteri</div>
        <div class="value">
          ${order.customerName}<br/>
          ${order.customerPhone}<br/>
          ${order.customerEmail}
        </div>
      </div>
      <div class="info-block">
        <div class="label">Teslimat Adresi</div>
        <div class="value">
          ${order.shippingAddress}<br/>
          ${order.shippingDistrict} / ${order.shippingCity}
          ${order.shippingPostalCode ? `<br/>${order.shippingPostalCode}` : ""}
        </div>
      </div>
    </div>

    <!-- Order Meta -->
    <div style="padding: 0 48px 16px; display: flex; gap: 24px; border-bottom: 2px solid #f5f5f4;">
      <div class="info-block" style="padding-bottom: 24px;">
        <div class="label">Sipariş Durumu</div>
        <span class="status-badge">${statusLabel(order.status)}</span>
      </div>
      <div class="info-block" style="padding-bottom: 24px;">
        <div class="label">Ödeme Yöntemi</div>
        <span class="status-badge">${paymentMethodLabel(order.paymentMethod)}</span>
      </div>
      ${order.trackingNumber ? `
      <div class="info-block" style="padding-bottom: 24px;">
        <div class="label">Kargo Takip No</div>
        <div class="value">${order.shippingCarrier || ""} — ${order.trackingNumber}</div>
      </div>` : ""}
    </div>

    <!-- Items -->
    <div class="items-section">
      <div class="section-title">Sipariş Kalemleri</div>
      <table>
        <thead>
          <tr>
            <th>Ürün</th>
            <th class="text-right">Miktar</th>
            <th class="text-right">Birim Fiyat</th>
            <th class="text-right">Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span class="key">Ara Toplam (KDV Dahil)</span>
        <span class="val">${subtotal.toLocaleString("tr-TR")} ₺</span>
      </div>
      <div class="total-row">
        <span class="key">KDV (%20)</span>
        <span class="val">${kdv.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺</span>
      </div>
      <div class="total-row">
        <span class="key">Kargo</span>
        <span class="val" style="color: #16a34a;">Ücretsiz</span>
      </div>
      <div class="total-row grand">
        <span class="key">Ödenecek Tutar</span>
        <span class="val">${total.toLocaleString("tr-TR")} ₺</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">© 2026 Sunix Store · Sunix Teknoloji</div>
      <div class="footer-note">Bu belge elektronik ortamda oluşturulmuştur.</div>
    </div>
  </div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return new NextResponse("Giriş yapmanız gerekiyor.", { status: 401 });
    }
    console.error("INVOICE ERROR:", error);
    return new NextResponse("Fatura oluşturulurken hata oluştu.", { status: 500 });
  }
}
