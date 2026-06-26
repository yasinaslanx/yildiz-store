import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Giriş yapmalısınız." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "Dosya bulunamadı." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Sadece resim yükleyebilirsiniz." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(uploadPath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("USER UPLOAD ERROR:", error);
    return NextResponse.json({ success: false, message: "Dosya yüklenemedi." }, { status: 500 });
  }
}
