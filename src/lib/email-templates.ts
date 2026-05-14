type OrderEmailItem = {
  productName: string;
  brand: string;
  color: string;
  storage?: string | null;
  quantity: number;
  price: number;
};

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: OrderEmailItem[];
};

export function orderCreatedEmail(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong>${item.productName}</strong><br />
            <span style="color:#666;font-size:13px;">
              ${item.brand} / ${item.color}${item.storage ? ` / ${item.storage}` : ""}
            </span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
            ${item.price.toLocaleString("tr-TR")} TL
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <h1>Siparişiniz alındı</h1>
      <p>Merhaba ${data.customerName},</p>
      <p><strong>${data.orderNumber}</strong> numaralı siparişiniz başarıyla oluşturuldu.</p>

      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th style="padding:12px;text-align:left;border-bottom:2px solid #111;">Ürün</th>
            <th style="padding:12px;text-align:center;border-bottom:2px solid #111;">Adet</th>
            <th style="padding:12px;text-align:right;border-bottom:2px solid #111;">Fiyat</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <p style="font-size:18px;margin-top:24px;">
        <strong>Toplam: ${data.totalAmount.toLocaleString("tr-TR")} TL</strong>
      </p>

      <p style="color:#666;margin-top:32px;">
        Sipariş durumunuzu hesabınızdaki Siparişlerim sayfasından takip edebilirsiniz.
      </p>
    </div>
  `;
}

export function paymentSuccessEmail(data: OrderEmailData) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <h1>Ödemeniz başarılı</h1>
      <p>Merhaba ${data.customerName},</p>
      <p><strong>${data.orderNumber}</strong> numaralı siparişinizin ödemesi başarıyla alındı.</p>
      <p style="font-size:18px;"><strong>Tutar: ${data.totalAmount.toLocaleString("tr-TR")} TL</strong></p>
      <p>Siparişiniz hazırlanma sürecine alınmıştır.</p>
    </div>
  `;
}

export function shippingUpdatedEmail(data: {
  orderNumber: string;
  customerName: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <h1>Siparişiniz kargoya verildi</h1>
      <p>Merhaba ${data.customerName},</p>
      <p><strong>${data.orderNumber}</strong> numaralı siparişiniz kargoya verildi.</p>

      <div style="margin-top:24px;padding:16px;border:1px solid #eee;border-radius:12px;">
        <p><strong>Kargo Firması:</strong> ${data.shippingCarrier ?? "-"}</p>
        <p><strong>Takip No:</strong> ${data.trackingNumber ?? "-"}</p>
        ${
          data.trackingUrl
            ? `<p><a href="${data.trackingUrl}" target="_blank">Kargoyu takip et</a></p>`
            : ""
        }
      </div>
    </div>
  `;
}

export function passwordResetEmail(data: {
  firstName?: string | null;
  resetUrl: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <h1>Şifre sıfırlama</h1>

      <p>Merhaba ${data.firstName ?? ""},</p>

      <p>
        Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
        Bu bağlantı 30 dakika boyunca geçerlidir.
      </p>

      <p style="margin-top:24px;">
        <a
          href="${data.resetUrl}"
          style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;"
        >
          Şifremi Sıfırla
        </a>
      </p>

      <p style="margin-top:24px;color:#666;font-size:13px;">
        Eğer bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.
      </p>
    </div>
  `;
}
