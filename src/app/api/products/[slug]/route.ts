import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    active: product.active,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    images: product.images,
    variants: product.variants.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      storage: variant.storage,
      price: Number(variant.price),
      stock: variant.stock,
      active: variant.active,
      images: variant.images,
    })),
  };
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        active: true,
      },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        variants: {
          where: {
            active: true,
          },
          include: {
            images: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: [
            {
              price: "asc",
            },
          ],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Ürün bulunamadı." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProduct(product),
    });
  } catch (error) {
    console.error("GET PRODUCT DETAIL ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ürün detayı alınamadı." },
      { status: 500 },
    );
  }
}
