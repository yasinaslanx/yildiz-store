import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { sessionId } = await params;
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { text, sender } = body;

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        text,
        sender,
      },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        lastMessage: text,
        updatedAt: new Date()
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
