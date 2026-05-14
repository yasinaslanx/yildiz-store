import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
                            <td style="padding-left:12px;font-size:18px;font-weight:900;color:#1c1917;letter-spacing:-0.5px;text-transform:uppercase;">YıldızStore</td>
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
                    © 2026 YıldızStore · Premium Teknoloji Mağazası
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
      from: 'YıldızStore <onboarding@resend.dev>', // Use Resend's testing domain
      to,
      subject: "Şifre Sıfırlama Talebi — YıldızStore",
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
    }
  } catch (error) {
    console.error("Resend Exception:", error);
  }
}
