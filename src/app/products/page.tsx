"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCategories, fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  image: string;
  price: number;
  stock: number;
  category: Category | null;
  variants: {
    id: string;
    color: string;
    storage?: string | null;
    price: number;
    stock: number;
    active: boolean;
    images: { url: string }[];
  }[];
};

type ProductsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Number(searchParams.get("page") ?? "1");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productsResult, categoriesResult] = await Promise.all([
        fetchProducts({
          q: searchParams.get("q") ?? undefined,
          category: searchParams.get("category") ?? undefined,
          brand: searchParams.get("brand") ?? undefined,
          sort: searchParams.get("sort") ?? "newest",
          minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
          maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
          page,
          limit: 12,
        }),
        fetchCategories(),
      ]);

      setProducts(productsResult.data);
      setMeta(productsResult.meta);
      setCategories(categoriesResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürünler alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setBrand(searchParams.get("brand") ?? "");
    setSort(searchParams.get("sort") ?? "newest");
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function updateUrl(next: {
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
    page?: number;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) {
      if (next.q.trim()) params.set("q", next.q.trim());
      else params.delete("q");
    }

    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }

    if (next.brand !== undefined) {
      if (next.brand) params.set("brand", next.brand);
      else params.delete("brand");
    }

    if (next.sort !== undefined) {
      if (next.sort) params.set("sort", next.sort);
      else params.delete("sort");
    }

    if (next.minPrice !== undefined) {
      if (next.minPrice) params.set("minPrice", next.minPrice);
      else params.delete("minPrice");
    }

    if (next.maxPrice !== undefined) {
      if (next.maxPrice) params.set("maxPrice", next.maxPrice);
      else params.delete("maxPrice");
    }

    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    } else {
      params.delete("page");
    }

    const query = params.toString();
    router.push(`/products${query ? `?${query}` : ""}`);
  }

  const brands = ["Apple", "Samsung", "Xiaomi", "Huawei", "Sony", "JBL"];

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end border-b border-stone-100 pb-12">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-stone-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">YıldızStore Katalog</p>
           </div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-900 uppercase">
             {q ? `"${q}" İçin Sonuçlar` : "Tüm Ürünler"}
          </h1>
          <p className="mt-4 text-stone-500 max-w-lg font-medium leading-relaxed">
            Teknolojinin en yeni ve en şık halini keşfedin. İhtiyacınız olan her şey tek bir noktada.
          </p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sıralama</span>
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value, page: 1 })}
                className="mt-1 cursor-pointer bg-transparent text-sm font-black text-stone-900 outline-none"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="name-asc">İsim (A-Z)</option>
              </select>
           </div>
           <div className="h-10 w-px bg-stone-100" />
           <div className="text-right">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sonuç</p>
              <p className="text-sm font-black text-stone-900 uppercase">{meta.total} Ürün</p>
           </div>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Filters */}
        <aside className="space-y-10">
          {/* Categories */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Kategoriler</h3>
             <div className="space-y-3">
                <button 
                  onClick={() => updateUrl({ category: "", page: 1 })}
                  className={`block w-full text-left text-xs font-bold uppercase tracking-widest transition ${category === "" ? "text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                >
                   Tüm Kategoriler
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateUrl({ category: cat.slug, page: 1 })}
                    className={`block w-full text-left text-xs font-bold uppercase tracking-widest transition ${category === cat.slug ? "text-stone-900" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    {cat.name}
                  </button>
                ))}
             </div>
          </div>

          {/* Brands */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Markalar</h3>
             <div className="grid grid-cols-2 gap-3">
                 {brands.map((b) => (
                  <button 
                    key={b}
                    onClick={() => updateUrl({ brand: brand === b ? "" : b, page: 1 })}
                    className={`rounded-xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition hover:border-black hover:text-stone-900 ${brand === b ? "bg-white border-black text-black shadow-md" : "bg-white border-stone-100 text-stone-500"}`}
                  >
                    {b}
                  </button>
                ))}
             </div>
          </div>

          {/* Price Range */}
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Fiyat Aralığı</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <input 
                     type="number" 
                     placeholder="Min"
                     className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-black transition"
                     value={minPrice}
                     onChange={e => setMinPrice(e.target.value)}
                   />
                   <span className="text-stone-300">—</span>
                   <input 
                     type="number" 
                     placeholder="Max"
                     className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-black transition"
                     value={maxPrice}
                     onChange={e => setMaxPrice(e.target.value)}
                   />
                </div>
                <button 
                  onClick={() => updateUrl({ minPrice, maxPrice, page: 1 })}
                  className="w-full rounded-xl border-2 border-black bg-white py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-md transition hover:bg-stone-50"
                >
                   Uygula
                </button>
             </div>
          </div>

          {/* Featured Badge Card */}
          <div className="rounded-[2rem] bg-stone-50 p-8 border border-stone-100">
             <span className="inline-flex items-center rounded-full bg-stone-900 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">PRO</span>
             <h4 className="mt-4 text-sm font-black text-stone-900 uppercase tracking-tighter">Premium Destek</h4>
             <p className="mt-2 text-[10px] font-bold text-stone-500 uppercase leading-relaxed tracking-widest">Aradığınızı bulamadınız mı? Canlı destek ekibimiz size yardımcı olsun.</p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section>
          {loading ? (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center">
               <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-100 border-t-black" />
               <p className="mt-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Ürünler Hazırlanıyor</p>
            </div>
          ) : error ? (
            <div className="rounded-[2.5rem] border border-red-100 bg-red-50 p-12 text-center">
               <p className="text-sm font-black text-red-700 uppercase tracking-widest">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[3rem] border border-dashed border-stone-200 p-24 text-center">
               <div className="mx-auto h-20 w-20 rounded-3xl bg-stone-50 flex items-center justify-center text-stone-300 text-4xl mb-8">?</div>
               <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Sonuç Bulunamadı</h2>
               <p className="mt-4 text-stone-400 font-medium max-w-xs mx-auto">Seçtiğiniz filtrelere uygun ürün bulunmamaktadır. Lütfen filtreleri güncelleyin.</p>
               <button 
                  onClick={() => router.push("/products")}
                  className="mt-10 rounded-full border-2 border-black bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50"
               >
                  Tüm Ürünleri Gör
               </button>
            </div>
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-20 flex items-center justify-center gap-8 border-t border-stone-100 pt-12">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => updateUrl({ page: meta.page - 1 })}
                  className="group flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-stone-100 text-stone-400 transition hover:border-black hover:text-stone-900 disabled:opacity-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                <div className="flex items-center gap-4">
                   <span className="text-xl font-black text-stone-900">{meta.page}</span>
                   <span className="text-xs font-bold text-stone-200">/</span>
                   <span className="text-sm font-bold text-stone-400">{meta.totalPages}</span>
                </div>

                <button
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => updateUrl({ page: meta.page + 1 })}
                  className="group flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-stone-100 text-stone-400 transition hover:border-black hover:text-stone-900 disabled:opacity-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
