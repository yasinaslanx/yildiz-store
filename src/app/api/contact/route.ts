import { NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    const result = await sendContactFormEmail(
      "aslanyasin320@gmail.com",
      name,
      email,
      subject,
      message
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "E-posta gönderilirken bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Mesajınız başarıyla gönderildi." });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
