import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const offers = await prisma.dealerOffer.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: { take: 1 },
            variants: {
              take: 1,
              select: { wholesalePrice: true, price: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error fetching dealer offers:", error);
    return NextResponse.json({ success: false, message: "Teklifler alınırken bir hata oluştu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, minQuantity, specialPrice, title, expiresAt } = body;

    if (!productId || !minQuantity || !specialPrice) {
      return NextResponse.json({ success: false, message: "Eksik bilgi girdiniz." }, { status: 400 });
    }

    const offer = await prisma.dealerOffer.create({
      data: {
        productId,
        minQuantity: parseInt(minQuantity),
        specialPrice: parseFloat(specialPrice),
        title,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true
      }
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error("Error creating dealer offer:", error);
    return NextResponse.json({ success: false, message: "Teklif oluşturulurken bir hata oluştu" }, { status: 500 });
  }
}
