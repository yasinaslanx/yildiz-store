import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatProduct(product: any) {
  const firstVariant = product.variants?.[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    featured: product.featured,
    active: product.active,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    image: firstVariant?.images?.[0]?.url ?? product.images?.[0]?.url ?? "",
    price: firstVariant ? Number(firstVariant.price) : 0,
    stock: product.variants.reduce(
      (sum: number, variant: any) => sum + variant.stock,
      0,
    ),
    variants: product.variants.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      storage: variant.storage,
      price: Number(variant.price),
      oldPrice: variant.oldPrice ? Number(variant.oldPrice) : null,
      stock: variant.stock,
      active: variant.active,
      images: variant.images,
    })),
    images: product.images,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();
    const featured = searchParams.get("featured") === "true";
    const sort = searchParams.get("sort") ?? "newest";

    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const brand = searchParams.get("brand")?.trim();

    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? "12"), 1),
      50,
    );

    const skip = (page - 1) * limit;

    const where: any = {
      active: true,
      variants: {
        some: {
          active: true,
          ...(minPrice !== undefined || maxPrice !== undefined ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            }
          } : {})
        },
      },
    };

    if (featured) {
      where.featured = true;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        {
          variants: {
            some: {
              active: true,
              OR: [
                { color: { contains: q, mode: "insensitive" } },
                { storage: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
        active: true,
      };
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : sort === "name-asc"
          ? { name: "asc" as const }
          : sort === "name-desc"
            ? { name: "desc" as const }
            : { createdAt: "desc" as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
            orderBy: {
              price: "asc",
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    let formattedProducts = products.map(formatProduct);

    if (sort === "price-asc") {
      formattedProducts = formattedProducts.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-desc") {
      formattedProducts = formattedProducts.sort((a, b) => b.price - a.price);
    }

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Ürünler alınamadı." },
      { status: 500 },
    );
  }
}
