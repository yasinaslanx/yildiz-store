import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { adminReviewSchema } from "@/lib/validations/review";
import { ZodError } from "zod";
import { getZodErrorMessage } from "@/lib/validation";

const db = prisma as any;

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz." }, { status: 403 });
    }

    const params = await context.params;
    const id = params?.id;
    const body = await request.json();
    const validated = adminReviewSchema.parse(body);

    const review = await db.productReview.update({
      where: { id },
      data: {
        status: validated.status,
        adminReply: validated.adminReply,
        comment: validated.comment,
        title: validated.title,
        rating: validated.rating
      }
    });

    return NextResponse.json({
      success: true,
      message: "Güncellendi",
      data: review
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, message: getZodErrorMessage(error) }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Yetkisiz." }, { status: 403 });
    }

    const params = await context.params;
    const id = params?.id;

    await db.productReview.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Silindi" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Hata oluştu." }, { status: 500 });
  }
}
