"use client";

import { useMemo, useState, useEffect } from "react";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductInfoSections } from "@/components/product/product-info-sections";
import { RecommendedProducts } from "@/components/product/recommended-products";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RecentlyViewedProducts } from "@/components/product/recently-viewed-products";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductQuestions } from "@/components/product/product-questions";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { useCart } from "@/store/cart-store";
import { useUi } from "@/store/ui-store";
import { Modal } from "@/components/ui/modal";
import { InstallmentTable } from "@/components/product/installment-table";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  Star,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  image: string;
  price: number;
  stock: number;
  category: { id: string, name: string, slug: string } | null;
  variants: {
    id: string;
    sku: string;
    color: string;
    storage?: string | null;
    price: number;
    stock: number;
    active: boolean;
    images: { url: string }[];
  }[];
};

export function ProductDetailView({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { openCart } = useUi();
  
  const colors = useMemo(() => Array.from(new Set(product.variants.map((v) => v.color))), [product.variants]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const storageOptions = useMemo(() => {
    const options = product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.storage)
      .filter(Boolean) as string[];
    return Array.from(new Set(options));
  }, [product.variants, selectedColor]);

  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] ?? "");
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);

  useEffect(() => {
    if (product.id) {
      addRecentlyViewed(product.id);
      if (product.category?.slug) {
        import("@/lib/recently-viewed").then(m => m.addRecentCategory(product.category!.slug));
      }
    }
  }, [product.id, product.category?.slug]);

  const viewCount = useMemo(() => (product.id.charCodeAt(0) * 123) % 1000 + 100, [product.id]);
  const rating = useMemo(() => 4.6 + (product.id.charCodeAt(0) % 4) / 10, [product.id]);

  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (variant) =>
        variant.color === selectedColor &&
        (variant.storage ?? "") === selectedStorage,
    );
  }, [product.variants, selectedColor, selectedStorage]);

  // Sadece seçili renge ait tüm görselleri topla (hafıza değişiminde resimlerin sıfırlanmasını engeller)
  const colorImages = useMemo(() => {
    const variantsOfColor = product.variants.filter((v) => v.color === selectedColor);
    const allImages: {url: string}[] = [];
    const seen = new Set<string>();
    
    for (const v of variantsOfColor) {
      for (const img of v.images) {
        if (!seen.has(img.url)) {
          seen.add(img.url);
          allImages.push(img);
        }
      }
    }
    
    // Eğer bu renkte hiç resim yoksa, ürünün ilk varyantının resimlerini fallback olarak kullan
    if (allImages.length === 0 && product.variants[0]?.images) {
      return product.variants[0].images;
    }
    
    return allImages;
  }, [product.variants, selectedColor]);

  const estimatedDelivery = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const availableStoragesForNewColor = product.variants
      .filter((v) => v.color === color)
      .map((v) => v.storage ?? "");
    const hasCurrentStorage = availableStoragesForNewColor.includes(selectedStorage);
    if (!hasCurrentStorage) {
      setSelectedStorage(availableStoragesForNewColor[0] ?? "");
    }
  };

  if (!selectedVariant) return null;

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-12">
        <Breadcrumbs 
          items={[
            { label: product.category?.name || "Koleksiyon", href: `/products?category=${product.category?.slug}` },
            { label: product.name }
          ]} 
        />
      </div>

      <div className="grid gap-20 lg:grid-cols-[1fr_500px]">
        <div className="space-y-32">
          <ProductGallery images={colorImages} alt={`${product.name} ${selectedColor}`} />
          <ProductInfoSections product={product} />
        </div>

        <div className="lg:sticky lg:top-32 h-fit space-y-16">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400">{product.brand}</p>
                 <div className="flex items-center gap-3">
                    <span className="bg-stone-50 border border-stone-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-900">
                       {product.category?.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-stone-300">
                       <Eye className="h-3.5 w-3.5" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">{viewCount} Görüntülenme</p>
                    </div>
                 </div>
              </div>
              <FavoriteButton 
                 id={selectedVariant.id}
                 productId={product.id}
                 productName={product.name}
                 brand={product.brand}
                 slug={product.slug}
                 image={selectedVariant.images[0]?.url || product.image}
                 price={selectedVariant.price}
               />
            </div>

            <div className="space-y-6">
               <h1 className="text-6xl font-black tracking-tighter text-stone-900 uppercase leading-[0.9] italic lg:text-7xl">
                 {product.name}
               </h1>
               
               <div className="flex items-center gap-8 border-y border-stone-50 py-6">
                  <div className="flex items-center gap-3">
                     <span className="text-2xl font-black text-stone-900 italic tracking-tighter">{rating.toFixed(1)}</span>
                     <div className="flex text-stone-900">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-current" : "text-stone-100"}`} />
                        ))}
                     </div>
                  </div>
                  <div className="h-4 w-px bg-stone-100" />
                  <p className="text-[10px] font-black text-stone-900 underline underline-offset-8 tracking-widest uppercase italic cursor-pointer hover:text-stone-500 transition">Tüm Yorumları Gör</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Güncel Fiyat</p>
                  <span className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    %20 İndirim
                  </span>
               </div>
               
               <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold text-stone-300 line-through decoration-stone-200 tracking-tighter">
                    {(selectedVariant.price * 1.25).toLocaleString("tr-TR")} ₺
                  </span>
                  <div className="flex items-baseline gap-6">
                    <span className="text-7xl font-black tracking-tighter text-stone-900 italic">
                      {selectedVariant.price.toLocaleString("tr-TR")} ₺
                    </span>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setIsInstallmentModalOpen(true)}
                        className="text-[10px] font-black text-stone-400 hover:text-stone-900 transition underline underline-offset-4 uppercase tracking-widest text-left"
                      >
                        Taksit Seçenekleri
                      </button>
                      {selectedVariant.stock < 10 && selectedVariant.stock > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-red-500">
                             <Clock className="h-3.5 w-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Acele Et!</span>
                          </div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase">Son {selectedVariant.stock} Ürün</p>
                        </div>
                      ) : selectedVariant.stock < 10 && (
                        <div className="flex items-center gap-2 text-red-500">
                           <TrendingUp className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Yoğun Talep</span>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-10">
              <VariantSelector
                label="Renk Seçimi"
                type="color"
                options={colors.map(c => ({
                  value: c,
                  inStock: product.variants.some(v => v.color === c && v.stock > 0)
                }))}
                selected={selectedColor}
                onChange={handleColorChange}
              />

              {storageOptions.length > 0 && (
                <VariantSelector
                  label="Hafıza Seçimi"
                  options={storageOptions.map(s => ({
                    value: s,
                    inStock: product.variants.some(v => v.color === selectedColor && v.storage === s && v.stock > 0)
                  }))}
                  selected={selectedStorage}
                  onChange={setSelectedStorage}
                />
              )}
            </div>

            <div className="space-y-8">
              {selectedVariant.stock > 0 ? (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      addItem({
                        id: selectedVariant.id,
                        productId: product.id,
                        productName: product.name,
                        brand: product.brand,
                        variantId: selectedVariant.id,
                        color: selectedVariant.color,
                        storage: selectedVariant.storage ?? undefined,
                        price: selectedVariant.price,
                        image: selectedVariant.images[0]?.url ?? product.image,
                        slug: product.slug,
                      });
                      openCart();
                    }}
                    className="group relative flex items-center justify-center rounded-full bg-stone-950 py-8 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95"
                  >
                    Sepete Ekle
                    <ArrowRight className="absolute right-10 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </button>
                  
                  <Link 
                    href="/checkout"
                    className="flex items-center justify-center rounded-full border-2 border-stone-950 bg-white py-6 text-xs font-black uppercase tracking-[0.2em] text-stone-950 transition-all hover:bg-stone-50 hover:shadow-lg active:scale-95"
                  >
                    Hemen Al
                  </Link>
                </div>
              ) : (
                <div className="rounded-[3rem] bg-stone-50 p-12 text-center border border-stone-100">
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-300 italic">Tükendi / Yakında Gelecek</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="space-y-2">
                     <Truck className="h-5 w-5 text-stone-900" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Ücretsiz Kargo</p>
                     <p className="text-[10px] font-medium text-stone-400 uppercase">{estimatedDelivery} tarihinde kapınızda</p>
                  </div>
                  <div className="space-y-2">
                     <ShieldCheck className="h-5 w-5 text-stone-900" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Orijinal Ürün</p>
                     <p className="text-[10px] font-medium text-stone-400 uppercase">Resmi Distribütör Garantili</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-40 border-t border-stone-100 pt-40 space-y-40">
         <ProductReviews productSlug={product.slug} productId={product.id} />
         <ProductQuestions productSlug={product.slug} productId={product.id} />
         <RecommendedProducts currentProductId={product.id} title="Sizin İçin Seçtiklerimiz" />
         <RecentlyViewedProducts currentProductId={product.id} />
      </div>

      <Modal isOpen={isInstallmentModalOpen} onClose={() => setIsInstallmentModalOpen(false)}>
        <InstallmentTable price={selectedVariant.price} />
      </Modal>
    </div>
  );
}
