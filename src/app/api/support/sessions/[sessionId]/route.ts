import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { status } = body;

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status },
    });

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
