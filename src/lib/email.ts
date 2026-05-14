import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Yıldız Store <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_123456789") {
    console.warn("RESEND_API_KEY tanımlı değil veya placeholder. Email gönderilmedi.");
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (EMAIL_FROM.includes("onboarding@resend.dev")) {
      console.log("NOT: Resend test modu (onboarding@resend.dev) kullanılıyor. Email sadece hesap sahibine gidebilir.");
    }

    return result;
  } catch (error) {
    console.error("Email send error (Resend):", error);
    return null;
  }
}

