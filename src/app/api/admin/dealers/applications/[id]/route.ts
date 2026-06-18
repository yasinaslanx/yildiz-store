import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requirePermission("USERS");

    const { id } = await context.params;
    const body = await request.json();
    const { status, adminNote } = body; // status can be APPROVED or REJECTED

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz durum." },
        { status: 400 }
      );
    }

    const application = await prisma.dealerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Başvuru bulunamadı." },
        { status: 404 }
      );
    }

    // Update application
    const updatedApplication = await prisma.dealerApplication.update({
      where: { id },
      data: {
        status,
        adminNote,
      },
    });

    // If APPROVED, update user role
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "DEALER" },
      });
    } else if (status === "REJECTED") {
      // If REJECTED or cancelled later, demote back to USER
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "USER" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Başvuru ${status === "APPROVED" ? "onaylandı" : "reddedildi"}.`,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH DEALER APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Başvuru güncellenemedi." },
      { status: 500 }
    );
  }
}
