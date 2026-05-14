import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/support - Admin list sessions
export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST /api/support - Start a new session
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    const session = await prisma.chatSession.create({
      data: {
        customerName: name,
        customerEmail: email,
        lastMessage: message,
        messages: {
          create: [
            {
              text: message,
              sender: "USER",
            },
            {
              text: `Merhaba ${name}! Mesajınız alındı. Müşteri temsilcimiz en kısa sürede size yanıt verecektir.`,
              sender: "BOT",
            }
          ]
        }
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.error("Support session creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create session", 
      details: error instanceof Error ? error.message : String(error),
      availableModels: models 
    }, { status: 500 });
  }
}
