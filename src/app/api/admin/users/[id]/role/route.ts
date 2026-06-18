import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdminUser();
    const { id: userId } = await context.params;

    const body = await request.json();
    const { role, permissions } = body;

    // Geçerli roller
    const validRoles = ["USER", "ADMIN", "DEALER"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz rol belirtildi." },
        { status: 400 }
      );
    }

    // Kendini adminlikten çıkarmasını engelle (isteğe bağlı güvenlik önlemi)
    if (adminUser.id === userId && role && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Kendi admin yetkinizi kaldıramazsınız." },
        { status: 403 }
      );
    }

    // Kullanıcıyı güncelle
    const updateData: any = {};
    if (role) updateData.role = role;
    if (permissions && Array.isArray(permissions)) updateData.permissions = permissions;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Kullanıcı yetkisi başarıyla güncellendi.",
      data: updatedUser
    });
  } catch (error: any) {
    console.error("UPDATE USER ROLE ERROR:", error);
    
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Rol güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}
