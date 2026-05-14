"use client";

import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/data/products";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "./product-card";
import { getRecentCategory } from "@/lib/recently-viewed";

type ProductsGridProps = {
  category?: ProductCategory;
  featuredOnly?: boolean;
  recommendationMode?: boolean;
};

export function ProductsGrid({
  category,
  featuredOnly = false,
  recommendationMode = false,
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        let fetchCategory = category;
        if (recommendationMode) {
          const recentCat = getRecentCategory();
          if (recentCat) {
            fetchCategory = recentCat as ProductCategory;
          }
        }

        let result = await fetchProducts({
          category: fetchCategory,
          featured: recommendationMode ? false : featuredOnly,
          limit: 12,
        });

        // Eğer önerilen kategoride ürün yoksa veya azsa, genel vitrin ürünlerine fallback yap
        if (recommendationMode && result.data.length === 0) {
          result = await fetchProducts({
            featured: true,
            limit: 12,
          });
        }

        if (mounted) {
          setProducts(result.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu");
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [category, featuredOnly]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="aspect-square rounded-2xl bg-stone-200" />
            <div className="mt-5 h-4 w-24 rounded bg-stone-200" />
            <div className="mt-3 h-6 w-2/3 rounded bg-stone-200" />
            <div className="mt-3 h-4 w-full rounded bg-stone-200" />
            <div className="mt-2 h-4 w-5/6 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--muted-foreground)]">
        Ürün bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
