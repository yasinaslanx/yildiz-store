import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    
    const { id } = await context.params;
    const body = await request.json();

    const quote = await prisma.order.update({
      where: { id },
      data: {
        quoteStatus: body.quoteStatus,
        totalAmount: body.totalAmount, // Admin can set a new discounted total
        quoteNote: body.quoteNote,
      },
    });

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("ADMIN UPDATE QUOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Talep güncellenemedi." },
      { status: 500 }
    );
  }
}
