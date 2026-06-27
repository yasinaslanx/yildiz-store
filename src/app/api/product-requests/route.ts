import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// GET: Authenticated user's own product requests
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    const requests = await prisma.productRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests.map(r => ({
        id: r.id,
        productName: r.productName,
        brand: r.brand,
        description: r.description,
        status: r.status,
        adminNote: r.adminNote,
        estimatedDays: r.estimatedDays,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET PRODUCT REQUESTS ERROR:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}

// POST: Submit a new product request (auth optional — guests allowed)
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { productName, brand, description, guestName, guestEmail } = body;

    if (!productName || productName.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Ürün adı en az 2 karakter olmalıdır." }, { status: 400 });
    }

    // Guest users need name + email
    if (!user && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmadan talep gönderebilmek için ad ve e-posta zorunludur." },
        { status: 400 }
      );
    }

    const request = await prisma.productRequest.create({
      data: {
        productName: productName.trim(),
        brand: brand?.trim() || null,
        description: description?.trim() || null,
        userId: user?.id || null,
        guestName: user ? null : guestName?.trim(),
        guestEmail: user ? null : guestEmail?.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: request.id,
        productName: request.productName,
        status: request.status,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    console.error("POST PRODUCT REQUEST ERROR:", error);
    return NextResponse.json({ success: false, message: "Talep gönderilemedi." }, { status: 500 });
  }
}
