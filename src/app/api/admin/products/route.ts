import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    await requireAdminUser();

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("ADMIN GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Ürünler alınamadı." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();

    const body = await request.json();

    const {
      name,
      slug,
      description,
      brand,
      categoryId,
      variants,
    } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Eksik alanlar var." },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        categoryId,
        active: true,

        ...(variants?.length ? {
          variants: {
            create: variants.map((v: any) => ({
              sku: v.sku,
              color: v.color,
              storage: v.storage ?? null,
              price: new Prisma.Decimal(v.price),
              stock: v.stock ?? 0,
              active: true,
            })),
          }
        } : {}),

        // Ana görsel ekleme
        images: body.mainImage ? {
          create: {
            url: body.mainImage,
            order: 0
          }
        } : undefined
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("ADMIN CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ürün oluşturulamadı." },
      { status: 500 },
    );
  }
}
