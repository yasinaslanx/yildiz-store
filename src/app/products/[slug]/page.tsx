import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/product/product-detail-view";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
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
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price),
    }))
  };
}

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
      title: `${product.name} | YıldızStore`,
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
