"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function RecommendedProducts({ 
  currentProductId, 
  title = "Bunları Da Sevebilirsiniz",
  filterBrand 
}: { 
  currentProductId: string;
  title?: string;
  filterBrand?: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        let url = `/api/products?limit=8`;
        if (filterBrand) {
          url += `&brand=${encodeURIComponent(filterBrand)}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          // Mevcut ürünü listeden çıkar ve karıştır (shuffle)
          const filtered = data.data
            .filter((p: any) => p.id !== currentProductId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
            
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Recommended fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommended();
  }, [currentProductId, filterBrand]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-32">
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900">{title}</h2>
        <div className="h-px flex-1 bg-stone-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.slug}`}
            className="group block space-y-6"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-50 border border-stone-100 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-stone-200">
              <Image
                src={product.image || (product.variants?.[0]?.images?.[0]?.url) || ""}
                alt={product.name}
                fill
                className="object-contain p-10 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-6 left-6 right-6">
                 <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-sm opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    İncele
                 </span>
              </div>
            </div>
            
            <div className="px-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{product.brand}</p>
               <h3 className="mt-2 text-lg font-black uppercase tracking-tighter text-stone-900 line-clamp-1">{product.name}</h3>
               <p className="mt-2 text-sm font-bold text-stone-900">
                 {Number(product.price || product.variants?.[0]?.price || 0).toLocaleString("tr-TR")} ₺
               </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
