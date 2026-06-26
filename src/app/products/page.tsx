"use client";

import { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchBrands, fetchCategories, fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";
import { SlidersHorizontal, X, ChevronDown, Check, Package } from "lucide-react";

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

// ── Fiyat Slider Bileşeni ──────────────────────────────────────────────────────
function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const rangeRef = useRef<HTMLDivElement>(null);

  const getPercent = (val: number) =>
    Math.round(((val - min) / (max - min)) * 100);

  const leftPct = getPercent(valueMin);
  const rightPct = getPercent(valueMax);

  return (
    <div className="space-y-4">
      {/* Track */}
      <div ref={rangeRef} className="relative h-1.5 w-full rounded-full bg-stone-100">
        <div
          className="absolute h-full rounded-full bg-stone-900"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), valueMax - 1);
            onChange(val, valueMax);
          }}
          className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-900 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), valueMin + 1);
            onChange(valueMin, val);
          }}
          className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-900 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        <span className="text-[10px] font-black text-stone-500">{valueMin.toLocaleString("tr-TR")} ₺</span>
        <span className="text-[10px] font-black text-stone-500">{valueMax.toLocaleString("tr-TR")} ₺</span>
      </div>
    </div>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [meta, setMeta] = useState<ProductsMeta>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");

  // Slider local state (commit on mouse up)
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000;
  const [sliderMin, setSliderMin] = useState(Number(searchParams.get("minPrice") ?? PRICE_MIN));
  const [sliderMax, setSliderMax] = useState(Number(searchParams.get("maxPrice") ?? PRICE_MAX));

  const [loading, setLoading] = useState(true);
  const [isAppendingLoading, setIsAppendingLoading] = useState(false);
  const isAppendingRef = useRef(false);
  const [error, setError] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedCategories = category ? category.split(",") : [];
  const selectedBrands = brand ? brand.split(",") : [];

  const page = Number(searchParams.get("page") ?? "1");

  // ── Aktif filtre sayısı ───────────────────────────────────────────────────
  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStock ? 1 : 0);

  async function loadData() {
    try {
      if (!isAppendingRef.current) {
        setLoading(true);
      } else {
        setIsAppendingLoading(true);
      }
      setError("");

      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        fetchProducts({
          q: searchParams.get("q") ?? undefined,
          category: searchParams.get("category") ?? undefined,
          brand: searchParams.get("brand") ?? undefined,
          sort: searchParams.get("sort") ?? "newest",
          minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
          maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
          inStock: searchParams.get("inStock") === "true" ? true : undefined,
          page,
          limit: 12,
        }),
        fetchCategories(),
        fetchBrands(),
      ]);

      if (isAppendingRef.current) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = productsResult.data.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        isAppendingRef.current = false;
      } else {
        setProducts(productsResult.data);
      }
      
      setMeta(productsResult.meta);
      setCategories(categoriesResult);
      setBrands(brandsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürünler alınamadı.");
    } finally {
      setLoading(false);
      setIsAppendingLoading(false);
    }
  }

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setBrand(searchParams.get("brand") ?? "");
    setSort(searchParams.get("sort") ?? "newest");
    setInStock(searchParams.get("inStock") === "true");
    const spMin = Number(searchParams.get("minPrice") ?? PRICE_MIN);
    const spMax = Number(searchParams.get("maxPrice") ?? PRICE_MAX);
    setSliderMin(spMin);
    setSliderMax(spMax);
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
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
    inStock?: boolean;
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
    if (next.inStock !== undefined) {
      if (next.inStock) params.set("inStock", "true");
      else params.delete("inStock");
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

  function clearAllFilters() {
    setSliderMin(PRICE_MIN);
    setSliderMax(PRICE_MAX);
    router.push("/products");
  }

  // ── Sidebar İçeriği ───────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="space-y-10">
      {/* Kategoriler */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Kategoriler</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => updateUrl({ category: "", page: 1 })}
              className="text-[10px] text-stone-400 hover:text-stone-900 font-bold uppercase transition"
            >
              Temizle
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const newCat = isSelected
                    ? selectedCategories.filter((c) => c !== cat.slug)
                    : [...selectedCategories, cat.slug];
                  updateUrl({ category: newCat.join(","), page: 1 });
                }}
                className="group flex items-center gap-3 w-full text-left"
              >
                <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${isSelected ? "bg-stone-900 border-stone-900" : "border-stone-200 bg-white group-hover:border-stone-500"}`}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest transition ${isSelected ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Markalar */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Markalar</h3>
          {selectedBrands.length > 0 && (
            <button
              onClick={() => updateUrl({ brand: "", page: 1 })}
              className="text-[10px] text-stone-400 hover:text-stone-900 font-bold uppercase transition"
            >
              Temizle
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const isSelected = selectedBrands.includes(b);
            return (
              <button
                key={b}
                onClick={() => {
                  const newBrand = isSelected
                    ? selectedBrands.filter((br) => br !== b)
                    : [...selectedBrands, b];
                  updateUrl({ brand: newBrand.join(","), page: 1 });
                }}
                className={`rounded-xl border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition hover:border-stone-900 hover:text-stone-900 ${
                  isSelected
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-white border-stone-100 text-stone-500"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fiyat Aralığı — Slider */}
      <div className="space-y-5">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Fiyat Aralığı</h3>
        <PriceRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          valueMin={sliderMin}
          valueMax={sliderMax}
          onChange={(min, max) => {
            setSliderMin(min);
            setSliderMax(max);
          }}
        />
        {/* Manuel giriş */}
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min ₺"
            className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2.5 text-[10px] font-black outline-none focus:border-stone-900 transition"
            value={sliderMin || ""}
            onChange={(e) => setSliderMin(Number(e.target.value) || PRICE_MIN)}
          />
          <span className="text-stone-300 flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Max ₺"
            className="w-full rounded-xl border border-stone-100 bg-stone-50/50 px-3 py-2.5 text-[10px] font-black outline-none focus:border-stone-900 transition"
            value={sliderMax === PRICE_MAX ? "" : sliderMax}
            onChange={(e) => setSliderMax(Number(e.target.value) || PRICE_MAX)}
          />
        </div>
        <button
          onClick={() =>
            updateUrl({
              minPrice: sliderMin > PRICE_MIN ? String(sliderMin) : "",
              maxPrice: sliderMax < PRICE_MAX ? String(sliderMax) : "",
              page: 1,
            })
          }
          className="w-full rounded-xl border-2 border-stone-900 bg-white py-3 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50"
        >
          Uygula
        </button>
      </div>

      {/* Stok Filtresi */}
      <div className="space-y-5">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Stok Durumu</h3>
        <button
          onClick={() => updateUrl({ inStock: !inStock, page: 1 })}
          className="group flex items-center gap-3 w-full text-left"
        >
          <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${inStock ? "bg-stone-900 border-stone-900" : "border-stone-200 bg-white group-hover:border-stone-500"}`}>
            {inStock && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest transition ${inStock ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"}`}>
            Yalnızca Stokta Olanlar
          </span>
        </button>
      </div>

      {/* PRO Destek Kartı */}
      <div className="rounded-[2rem] bg-stone-50 p-6 border border-stone-100">
        <span className="inline-flex items-center rounded-full bg-stone-900 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">PRO</span>
        <h4 className="mt-3 text-sm font-black text-stone-900 uppercase tracking-tighter">Premium Destek</h4>
        <p className="mt-2 text-[10px] font-bold text-stone-500 uppercase leading-relaxed tracking-widest">Aradığınızı bulamadınız mı? Canlı destek ekibimiz size yardımcı olsun.</p>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      {/* Mobil Filtre Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white p-8 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">Filtreler</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end border-b border-stone-100 pb-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-stone-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Yıldız Store Katalog</p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-stone-900 uppercase">
            {q ? `"${q}" İçin Sonuçlar` : "Tüm Ürünler"}
          </h1>
          <p className="mt-4 text-stone-500 max-w-lg font-medium leading-relaxed">
            Teknolojinin en yeni ve en şık halini keşfedin. İhtiyacınız olan her şey tek bir noktada.
          </p>

          {/* Mobil Arama */}
          <div className="mt-6 block lg:hidden">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                updateUrl({ q, page: 1 });
              }}
              className="relative"
            >
              <input
                name="search"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ürün veya model ara..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-6 py-4 text-xs font-bold text-stone-900 outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all pr-12 shadow-sm"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mobil Filtre Butonu */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="relative flex items-center gap-2 rounded-full border-2 border-stone-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-900 hover:border-stone-900 transition lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtrele
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[9px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sıralama */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sıralama</span>
            <div className="relative mt-1">
              <select
                value={sort}
                onChange={(e) => updateUrl({ sort: e.target.value, page: 1 })}
                className="cursor-pointer appearance-none bg-transparent text-sm font-black text-stone-900 outline-none pr-5"
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="name-asc">İsim (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-400 pointer-events-none" />
            </div>
          </div>
          <div className="h-10 w-px bg-stone-100" />
          <div className="text-right">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sonuç</p>
            <p className="text-sm font-black text-stone-900 uppercase">{meta.total} Ürün</p>
          </div>
        </div>
      </div>

      {/* Aktif Filtre Etiketleri */}
      {activeFilterCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-1">Aktif Filtreler:</span>

          {selectedCategories.map((slug) => {
            const cat = categories.find((c) => c.slug === slug);
            return (
              <button
                key={slug}
                onClick={() => updateUrl({ category: selectedCategories.filter((c) => c !== slug).join(","), page: 1 })}
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-700 hover:border-stone-900 transition"
              >
                {cat?.name ?? slug}
                <X className="h-3 w-3" />
              </button>
            );
          })}

          {selectedBrands.map((b) => (
            <button
              key={b}
              onClick={() => updateUrl({ brand: selectedBrands.filter((br) => br !== b).join(","), page: 1 })}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-700 hover:border-stone-900 transition"
            >
              {b}
              <X className="h-3 w-3" />
            </button>
          ))}

          {minPrice && (
            <button
              onClick={() => { setSliderMin(PRICE_MIN); updateUrl({ minPrice: "", page: 1 }); }}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-700 hover:border-stone-900 transition"
            >
              Min {Number(minPrice).toLocaleString("tr-TR")} ₺
              <X className="h-3 w-3" />
            </button>
          )}

          {maxPrice && (
            <button
              onClick={() => { setSliderMax(PRICE_MAX); updateUrl({ maxPrice: "", page: 1 }); }}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-700 hover:border-stone-900 transition"
            >
              Max {Number(maxPrice).toLocaleString("tr-TR")} ₺
              <X className="h-3 w-3" />
            </button>
          )}

          {inStock && (
            <button
              onClick={() => updateUrl({ inStock: false, page: 1 })}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-700 hover:border-stone-900 transition"
            >
              Stokta
              <X className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={clearAllFilters}
            className="ml-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition underline underline-offset-2"
          >
            Tümünü Temizle
          </button>
        </div>
      )}

      {/* Ana Grid */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <SidebarContent />
        </aside>

        {/* Ürün Alanı */}
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
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-stone-50">
                <Package className="h-10 w-10 text-stone-200" />
              </div>
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Sonuç Bulunamadı</h2>
              <p className="mt-4 text-stone-400 font-medium max-w-xs mx-auto">Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.</p>
              <button
                onClick={clearAllFilters}
                className="mt-10 rounded-full border-2 border-stone-200 bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:border-stone-900"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* Load More Button */}
              {meta.page < meta.totalPages && (
                <div className="mt-20 flex items-center justify-center border-t border-stone-100 pt-12">
                  <button
                    disabled={isAppendingLoading}
                    onClick={() => {
                      isAppendingRef.current = true;
                      updateUrl({ page: meta.page + 1 });
                    }}
                    className="group flex items-center gap-3 rounded-full border-2 border-stone-900 bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-50"
                  >
                    {isAppendingLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent group-hover:border-white group-hover:border-t-transparent" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    )}
                    {isAppendingLoading ? "Yükleniyor..." : "Daha Fazla Ürün Yükle"}
                  </button>
                </div>
              )}
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
