import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ success: false, message: "Geçersiz abonelik verisi." }, { status: 400 });
    }

    const { endpoint, keys } = subscription;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: sessionUser?.id || null,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: sessionUser?.id || null,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push bildirim aboneliği kaydedildi.",
    });
  } catch (error: unknown) {
    console.error("PUSH SUBSCRIPTION ERROR:", error);
    return NextResponse.json({ success: false, message: "Abonelik kaydedilemedi." }, { status: 500 });
  }
}
