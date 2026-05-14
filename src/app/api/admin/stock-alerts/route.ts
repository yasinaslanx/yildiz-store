import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  try {
    await requireAdminUser();

    const alerts = await prisma.stockAlert.findMany({
      include: {
        variant: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, data: alerts });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Hata oluştu." }, { status: 500 });
  }
}
