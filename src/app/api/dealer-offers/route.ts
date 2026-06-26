import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Yalnızca DEALER veya ADMIN görebilir
    if (user.role !== "DEALER" && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Sadece bayiler görebilir" }, { status: 403 });
    }

    const offers = await prisma.dealerOffer.findMany({
      where: {
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ],
        product: {
          active: true
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    console.error("Error fetching public dealer offers:", error);
    return NextResponse.json({ success: false, message: "Teklifler alınırken bir hata oluştu" }, { status: 500 });
  }
}
