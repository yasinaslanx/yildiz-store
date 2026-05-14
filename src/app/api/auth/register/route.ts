import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { ZodError } from "zod";
import { registerSchema } from "@/lib/validations/auth";
import { getZodErrorMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedBody = registerSchema.parse(body);

    const email = validatedBody.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(validatedBody.password);

    const createdUser = await prisma.user.create({
      data: {
        firstName: validatedBody.firstName,
        lastName: validatedBody.lastName,
        email,
        passwordHash,
      },
    });

    await setSessionCookie({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          role: createdUser.role.toLowerCase(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: getZodErrorMessage(error) },
        { status: 400 },
      );
    }

    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Kayıt işlemi başarısız oldu." },
      { status: 500 },
    );
  }
}