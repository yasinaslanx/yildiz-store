import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser();
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { firstName: true, lastName: true, email: true, phone: true }
    });

    const dealer = user ? {
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone
    } : null;

    const transactions = await prisma.dealerTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, transactions, dealer });
  } catch (error) {
    console.error("GET DEALER LEDGER ERROR:", error);
    return NextResponse.json({ success: false, message: "Cari hareketler alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await req.json();

    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json({ success: false, message: "Geçerli bir tutar girin." }, { status: 400 });
    }

    const transaction = await prisma.dealerTransaction.create({
      data: {
        userId: id,
        type: "PAYMENT",
        amount: new Prisma.Decimal(body.amount),
        currency: "USD",
        description: body.description || "Nakit Tahsilat",
      }
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("POST DEALER PAYMENT ERROR:", error);
    return NextResponse.json({ success: false, message: "Ödeme eklenemedi." }, { status: 500 });
  }
}
