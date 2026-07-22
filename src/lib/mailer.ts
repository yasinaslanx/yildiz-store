import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "Sunix Store <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Şifre Sıfırlama</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #e7e5e4;border-radius:24px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:40px 48px 32px;border-bottom:2px solid #f5f5f4;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:40px;height:40px;border:2px solid #1c1917;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">★</td>
                            <td style="padding-left:12px;font-size:18px;font-weight:900;color:#1c1917;letter-spacing:-0.5px;text-transform:uppercase;">Sunix Store</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:48px;">
                  <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Güvenlik</p>
                  <h1 style="margin:0 0 24px;font-size:32px;font-weight:900;color:#1c1917;letter-spacing:-1px;text-transform:uppercase;">Şifre Sıfırlama</h1>
                  <p style="margin:0 0 16px;font-size:14px;color:#57534e;line-height:1.7;">Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
                  <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;line-height:1.7;">Bu bağlantı <strong style="color:#1c1917;">1 saat</strong> içinde geçerliliğini yitirecektir.</p>
                  
                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:100px;border:2px solid #1c1917;background:#ffffff;">
                        <a href="${resetUrl}" style="display:inline-block;padding:18px 40px;font-size:12px;font-weight:900;color:#1c1917;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">
                          Şifremi Sıfırla →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:32px 0 0;font-size:12px;color:#a8a29e;line-height:1.7;">
                    Eğer bu talebi siz yapmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz. Şifreniz değişmeyecektir.
                  </p>
                  
                  <hr style="margin:32px 0;border:none;border-top:2px solid #f5f5f4;" />
                  
                  <p style="margin:0;font-size:11px;color:#a8a29e;">
                    Bağlantı çalışmıyorsa şu adresi kopyalayıp tarayıcınıza yapıştırın:<br />
                    <span style="color:#1c1917;word-break:break-all;">${resetUrl}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 48px;border-top:2px solid #f5f5f4;background:#fafaf9;">
                  <p style="margin:0;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:2px;">
                    © 2026 Sunix Store · Premium Teknoloji Mağazası
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Şifre Sıfırlama Talebi — Sunix Store",
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
    }
  } catch (error) {
    console.error("Resend Exception:", error);
  }
}

export async function sendOtpEmail(to: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Giriş Doğrulama Kodu</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #e7e5e4;border-radius:24px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:40px 48px 32px;border-bottom:2px solid #f5f5f4;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:40px;height:40px;border:2px solid #1c1917;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">★</td>
                            <td style="padding-left:12px;font-size:18px;font-weight:900;color:#1c1917;letter-spacing:-0.5px;text-transform:uppercase;">Sunix Store</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:48px;">
                  <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Güvenlik</p>
                  <h1 style="margin:0 0 24px;font-size:32px;font-weight:900;color:#1c1917;letter-spacing:-1px;text-transform:uppercase;">Doğrulama Kodu</h1>
                  <p style="margin:0 0 16px;font-size:14px;color:#57534e;line-height:1.7;">Sunix Store'a güvenle giriş yapabilmek için tek kullanımlık doğrulama kodunuz aşağıdadır.</p>
                  <p style="margin:0 0 32px;font-size:14px;color:#a8a29e;line-height:1.7;">Bu kod <strong style="color:#1c1917;">3 dakika</strong> içinde geçerliliğini yitirecektir.</p>
                  
                  <!-- OTP Code -->
                  <div style="background-color:#fafaf9;border:2px solid #e7e5e4;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
                    <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1c1917;">${code}</span>
                  </div>

                  <p style="margin:32px 0 0;font-size:12px;color:#a8a29e;line-height:1.7;">
                    Eğer bu talebi siz yapmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 48px;border-top:2px solid #f5f5f4;background:#fafaf9;">
                  <p style="margin:0;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:2px;">
                    © 2026 Sunix Store · Premium Teknoloji Mağazası
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Giriş Doğrulama Kodunuz — Sunix Store",
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
    }
  } catch (error) {
    console.error("Resend Exception:", error);
  }
}

export async function sendAbandonedCartEmail(
  to: string,
  firstName: string,
  couponCode: string,
  cartItems: { name: string; price: number; image?: string }[],
  siteUrl: string = "https://sunixstore.com"
) {
  const itemRows = cartItems.slice(0, 3).map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f5f5f4;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:16px;">
              ${item.image
                ? `<img src="${item.image}" width="60" height="60" style="border-radius:12px;object-fit:cover;border:1px solid #e7e5e4;" />`
                : `<div style="width:60px;height:60px;background:#f5f5f4;border-radius:12px;"></div>`}
            </td>
            <td>
              <p style="margin:0;font-size:13px;font-weight:700;color:#1c1917;">${item.name}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#a8a29e;">${item.price.toLocaleString("tr-TR")} ₺</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sepetiniz Sizi Bekliyor</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #e7e5e4;border-radius:24px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:40px 48px 32px;border-bottom:2px solid #f5f5f4;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:40px;height:40px;border:2px solid #1c1917;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">★</td>
                      <td style="padding-left:12px;font-size:18px;font-weight:900;color:#1c1917;letter-spacing:-0.5px;text-transform:uppercase;">Sunix Store</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:48px;">
                  <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Sepetiniz Sizi Bekliyor 🛒</p>
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#1c1917;letter-spacing:-1px;">Merhaba ${firstName}!</h1>
                  <p style="margin:0 0 32px;font-size:14px;color:#57534e;line-height:1.7;">
                    Sepetinizde ürünler bıraktınız. Hâlâ buradalar ve sizin için hazır bekliyor!
                    Siparişi tamamlamak için size özel <strong style="color:#1c1917;">%5 indirim kuponu</strong> hazırladık.
                  </p>

                  <!-- Cart Items -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    ${itemRows}
                  </table>

                  <!-- Coupon Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#f5f5f4;border:2px dashed #d6d3d1;border-radius:16px;padding:24px;text-align:center;">
                        <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Kupon Kodunuz</p>
                        <p style="margin:0;font-size:28px;font-weight:900;color:#1c1917;letter-spacing:4px;">${couponCode}</p>
                        <p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">48 saat geçerli · Tek kullanımlık</p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:100px;background:#1c1917;">
                        <a href="${siteUrl}/cart" style="display:inline-block;padding:18px 40px;font-size:12px;font-weight:900;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">
                          Sepete Git ve Tamamla →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:32px 0 0;font-size:12px;color:#a8a29e;line-height:1.7;">
                    Bu e-postayı istemiyorsanız, bir daha gönderilmeyecektir. Sepetinizdeki ürünlerin stoğu sınırlı olabilir.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 48px;background:#f5f5f4;border-top:2px solid #e7e5e4;">
                  <p style="margin:0;font-size:11px;color:#a8a29e;text-align:center;">
                    © 2025 Sunix Store. Tüm hakları saklıdır.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `🛒 ${firstName}, sepetiniz sizi bekliyor! Özel kuponunuz: ${couponCode}`,
      html,
    });

    if (error) {
      console.error("Abandoned Cart Email Error:", error);
    }
  } catch (error) {
    console.error("Abandoned Cart Email Exception:", error);
  }
}

export async function sendContactFormEmail(
  to: string,
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family:Arial,sans-serif;padding:20px;">
      <h2>Yeni İletişim Formu Mesajı</h2>
      <p><strong>Gönderen:</strong> ${name}</p>
      <p><strong>E-Posta:</strong> ${email}</p>
      <p><strong>Konu:</strong> ${subject}</p>
      <hr/>
      <p><strong>Mesaj:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Yeni İletişim Mesajı: ${subject}`,
      replyTo: email,
      html,
    });

    if (error) {
      console.error("Contact Email Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error("Contact Email Exception:", error);
    return { success: false, error };
  }
}

export async function sendShippingEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl: string,
  carrier: string
) {
  const firstName = customerName.split(" ")[0];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Kargonuz Yola Çıktı</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #e7e5e4;border-radius:24px;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="padding:40px 48px 32px;border-bottom:2px solid #f5f5f4;background:#1c1917;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:40px;height:40px;border:2px solid #fff;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#fff;">★</td>
                      <td style="padding-left:12px;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;text-transform:uppercase;">Sunix Store</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:48px;">
                  <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Kargo Bildirimi 🚚</p>
                  <h1 style="margin:0 0 24px;font-size:28px;font-weight:900;color:#1c1917;letter-spacing:-1px;">Merhaba ${firstName}!</h1>
                  <p style="margin:0 0 32px;font-size:14px;color:#57534e;line-height:1.7;">
                    <strong>#${orderNumber}</strong> numaralı siparişiniz kargoya verildi. 
                    Kısa süre içinde kapınıza ulaşacak!
                  </p>

                  ${trackingNumber ? `
                  <!-- Tracking Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#fafaf9;border:2px solid #e7e5e4;border-radius:16px;padding:24px;">
                        ${carrier ? `<p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Kargo Firması</p>
                        <p style="margin:0 0 16px;font-size:16px;font-weight:900;color:#1c1917;">${carrier}</p>` : ""}
                        <p style="margin:0 0 8px;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:3px;">Takip Numarası</p>
                        <p style="margin:0;font-size:22px;font-weight:900;color:#1c1917;letter-spacing:3px;">${trackingNumber}</p>
                      </td>
                    </tr>
                  </table>` : ""}

                  ${trackingUrl ? `
                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="border-radius:100px;background:#1c1917;">
                        <a href="${trackingUrl}" style="display:inline-block;padding:18px 40px;font-size:12px;font-weight:900;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">
                          Kargumu Takip Et →
                        </a>
                      </td>
                    </tr>
                  </table>` : ""}

                  <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.7;">
                    Herhangi bir sorunuz için <a href="https://sunix.net.tr/contact" style="color:#1c1917;">iletişim sayfamızdan</a> bize ulaşabilirsiniz.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 48px;border-top:2px solid #f5f5f4;background:#fafaf9;">
                  <p style="margin:0;font-size:10px;font-weight:900;color:#a8a29e;text-transform:uppercase;letter-spacing:2px;">
                    © 2026 Sunix Store · Premium Teknoloji Mağazası
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `🚚 Kargonuz Yola Çıktı! Sipariş #${orderNumber}`,
      html,
    });

    if (error) {
      console.error("Shipping Email Error:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error("Shipping Email Exception:", error);
    return { success: false, error };
  }
}
