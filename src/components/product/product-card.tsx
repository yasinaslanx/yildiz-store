"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/store/cart-store";
import { useFavorites } from "@/store/favorites-store";
import { useUi } from "@/store/ui-store";
import { Star, Eye, Heart, ShoppingCart, TrendingUp } from "lucide-react";
import { useMemo } from "react";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openCart } = useUi();

  const firstVariant = product.variants[0];
  const imageObj = firstVariant?.images?.[0];
  const firstImage = (typeof imageObj === 'string' ? imageObj : (imageObj as any)?.url) || "https://placehold.co/600x600/f5f5f4/a8a29e?text=Gorsel+Yok";
  
  const favorite = isFavorite(firstVariant?.id || product.id);
  
  // Demo amaçlı: Bazı ürünlere (ID'si çift olanlara) otomatik indirim göster
  const hasDemoDiscount = product.id.length % 2 === 0;
  const displayOldPrice = firstVariant?.oldPrice || (hasDemoDiscount ? Number(firstVariant?.price || 0) * 1.25 : null);

  // Sosyal kanıt verileri (Zarif değerler)
  const viewCount = useMemo(() => (product.id.charCodeAt(0) * 123) % 1000 + 100, [product.id]);
  const rating = useMemo(() => 4.5 + (product.id.charCodeAt(0) % 5) / 10, [product.id]);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!firstVariant) return;
    addItem({
      id: `${product.id}-${firstVariant.id}`,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      variantId: firstVariant.id,
      color: firstVariant.color,
      storage: firstVariant.storage,
      price: firstVariant.price,
      image: firstImage,
    });
    openCart();
  }

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!firstVariant) return;
    toggleFavorite({
      id: firstVariant.id,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      slug: product.slug,
      image: firstImage,
      price: firstVariant.price,
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white transition-all duration-700 hover:border-stone-900 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
      {/* Görsel Alanı */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-white p-8">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-8 transition duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
        />
        
        {/* Rozetler (Türkçe) */}
        <div className="absolute left-8 top-8 flex flex-col gap-2 z-10">
           {displayOldPrice && Number(displayOldPrice) > Number(firstVariant?.price) && (
             <>
               <div className="bg-red-600 text-white px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">BÜYÜK İNDİRİM</p>
               </div>
               <div className="bg-green-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
                    %{Math.round(((Number(displayOldPrice) - Number(firstVariant?.price)) / Number(displayOldPrice)) * 100)} İndirim
                  </p>
               </div>
             </>
           )}
           <div className="bg-black text-white px-4 py-1.5 rounded-full shadow-lg">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">En Çok Satan</p>
           </div>
        </div>

        {/* Aksiyon Butonları */}
         <div className="absolute right-8 top-8 z-20 flex flex-col gap-2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleToggleFavorite}
              className={`cursor-pointer flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-transform hover:scale-110 ${
                favorite ? "text-stone-900" : "text-stone-300 hover:text-stone-900"
              }`}
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!firstVariant || firstVariant.stock <= 0}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-transform hover:scale-110 ${
                !firstVariant || firstVariant.stock <= 0 
                ? "opacity-50 cursor-not-allowed text-stone-200" 
                : "cursor-pointer text-stone-300 hover:text-stone-900"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
         </div>
      </Link>

      {/* İçerik Alanı */}
      <div className="flex flex-1 flex-col gap-4 p-10 pt-4">
        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{product.brand}</p>
              <div className="flex items-center gap-1.5">
                 <Eye className="h-3.5 w-3.5 text-stone-300" />
                 <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{viewCount} Görüntülenme</p>
              </div>
           </div>
           
           <Link href={`/products/${product.slug}`}>
             <h3 className="text-xl font-black leading-[1.1] text-stone-900 uppercase italic tracking-tighter group-hover:text-stone-600 transition-colors">
               {product.name}
             </h3>
           </Link>
           
           <div className="flex items-center gap-3">
              <div className="flex text-stone-900">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(rating) ? "fill-current" : "text-stone-100"}`} />
                 ))}
              </div>
              <p className="text-[10px] font-black text-stone-900 underline underline-offset-4 tracking-widest uppercase italic">Yorumlar</p>
           </div>
        </div>

        {/* Fiyat Alanı */}
        <div className="mt-auto pt-6 border-t border-stone-50">
           <div className="flex items-end justify-between">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Fiyat</p>
                      {displayOldPrice && Number(displayOldPrice) > Number(firstVariant?.price) && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">İndirimde</span>
                      )}
                   </div>
                   {displayOldPrice && Number(displayOldPrice) > Number(firstVariant?.price) && (
                     <p className="text-xs font-bold text-stone-300 line-through decoration-red-400 tracking-tighter mb-0.5">
                       {Number(displayOldPrice).toLocaleString("tr-TR")} ₺
                     </p>
                   )}
                   <p className="text-2xl font-black tracking-tighter text-stone-900 italic">
                     {firstVariant?.price.toLocaleString("tr-TR")} ₺
                   </p>
                </div>
              <div className="flex items-center gap-2 text-green-600 mb-1">
                 <TrendingUp className="h-3 w-3" />
                 <span className="text-[9px] font-black uppercase tracking-widest italic">Yoğun Talep</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
