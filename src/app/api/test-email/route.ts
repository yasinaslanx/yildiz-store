import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL ?? "admin@yildizstore.com",
    subject: "Yıldız Store test mail",
    html: "<h1>Mail sistemi çalışıyor ✅</h1><p>Bu bir test mailidir.</p>",
  });

  return NextResponse.json({
    success: true,
    data: result,
  });
}
