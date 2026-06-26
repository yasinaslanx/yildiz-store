import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 });
    }

    const offers = await prisma.customerOffer.findMany({
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Failed to fetch customer offers", error);
    return NextResponse.json({ success: false, message: "Teklifler alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();
    const { productId, specialPrice, active, title, expiresAt } = data;

    if (!productId || !specialPrice) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    const offer = await prisma.customerOffer.create({
      data: {
        productId,
        specialPrice: parseFloat(specialPrice),
        active: active ?? true,
        title: title || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    console.error("Failed to create customer offer", error);
    return NextResponse.json({ success: false, message: "Teklif oluşturulamadı" }, { status: 500 });
  }
}
