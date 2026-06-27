import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Şifreniz en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla oluşturuldu.",
    });
  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Şifre oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
