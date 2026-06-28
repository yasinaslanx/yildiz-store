import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { name: { contains: "fn-210", mode: "insensitive" } },
    include: { variants: true }
  });
  return NextResponse.json(products);
}
