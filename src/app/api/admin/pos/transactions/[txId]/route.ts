import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export async function GET(req: Request, context: { params: Promise<{ txId: string }> }) {
  try {
    await requireAdminUser();
    const { txId } = await context.params;

    const transaction = await prisma.dealerTransaction.findUnique({
      where: { id: txId },
      include: {
        user: true, // We need the dealer's info (name, phone)
      }
    });

    if (!transaction) {
      return NextResponse.json({ success: false, message: "İşlem bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("GET TRANSACTION ERROR:", error);
    return NextResponse.json({ success: false, message: "İşlem getirilemedi." }, { status: 500 });
  }
}
