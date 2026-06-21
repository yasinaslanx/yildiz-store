import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { role: string };
    
    // Yalnızca DEALER veya ADMIN görebilir
    if (decoded.role !== "DEALER" && decoded.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Sadece bayiler görebilir" }, { status: 403 });
    }

    const offers = await prisma.dealerOffer.findMany({
      where: {
        active: true,
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
