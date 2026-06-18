import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    // Sadece admin yetkisi olanlar erişebilir
    await requireAdminUser();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("GET USERS ERROR:", error);
    
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Kullanıcılar getirilirken hata oluştu" },
      { status: 500 }
    );
  }
}
