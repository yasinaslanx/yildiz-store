"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed } from "@/lib/recently-viewed";

export function RecentlyViewedProducts({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const ids = getRecentlyViewed().filter(id => id !== currentProductId);
      
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Mocking a fetch for multiple IDs or just using the products API
        const res = await fetch(`/api/products?ids=${ids.join(",")}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Recently viewed fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-32">
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900">Son İnceledikleriniz</h2>
        <div className="h-px flex-1 bg-stone-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.slug}`}
            className="group block space-y-6"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-50 border border-stone-100 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-stone-200">
              <Image
                src={product.image || product.variants?.[0]?.images?.[0]?.url || ""}
                alt={product.name}
                fill
                className="object-contain p-10 transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            <div className="px-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{product.brand}</p>
               <h3 className="mt-2 text-lg font-black uppercase tracking-tighter text-stone-900 line-clamp-1">{product.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
