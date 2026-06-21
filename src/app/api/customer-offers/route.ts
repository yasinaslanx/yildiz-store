import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const offers = await prisma.customerOffer.findMany({
      where: { active: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              select: { url: true },
              orderBy: { order: "asc" },
              take: 1,
            },
            variants: {
              select: { retailPrice: true, price: true },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Failed to fetch customer offers", error);
    return NextResponse.json(
      { success: false, message: "Teklifler alınamadı" },
      { status: 500 }
    );
  }
}
