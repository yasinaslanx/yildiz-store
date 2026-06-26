import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/product/product-detail-view";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

import { getSessionUser } from "@/lib/session";
import { cache } from "react";

const getProduct = cache(async (slug: string) => {
  const user = await getSessionUser();
  const isDealerOrAdmin = (user?.role as string) === "DEALER" || (user?.role as string) === "dealer" || (user?.role as string) === "ADMIN" || (user?.role as string) === "admin";

  const product = await prisma.product.findFirst({
    where: { 
      slug, 
      active: true,
      ...(!isDealerOrAdmin ? { isEarlyAccess: false } : {})
    },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: {
        where: { active: true },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!product) return null;

  // Format for the client component
  return {
    ...product,
    price: Number(product.variants[0]?.price || 0),
    stock: product.variants.reduce((acc, v) => acc + v.stock, 0),
    image: (product as any).images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || "",
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price),
      retailPrice: v.retailPrice ? Number(v.retailPrice) : null,
      dealerPrice: v.dealerPrice ? Number(v.dealerPrice) : null,
      wholesalePrice: v.wholesalePrice ? Number(v.wholesalePrice) : null,
      branchPrice: v.branchPrice ? Number(v.branchPrice) : null,
      buyPrice: v.buyPrice ? Number(v.buyPrice) : null,
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
    }))
  };
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Sunix Store`,
      description: product.description,
      images: product.variants[0]?.images[0]?.url ? [product.variants[0].images[0].url] : [],
    },
  };
}

export default async function ProductPage(props: PageProps) {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product as any} />;
}
