"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/store/cart-store";
import { useFavorites } from "@/store/favorites-store";
import { useUi } from "@/store/ui-store";
import { Star, Eye, Heart, ShoppingCart, TrendingUp, GitCompareArrows } from "lucide-react";
import { useMemo, useState } from "react";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useCurrency } from "@/store/currency-store";
import { useAuth } from "@/store/auth-store";
import { useCompare } from "@/store/compare-store";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCompare, isInCompare } = useCompare();
  const { openCart } = useUi();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const firstVariant = product.variants[0];
  const imageObj = firstVariant?.images?.[0] || (product as any).images?.[0] || product.image;
  const firstImage = (typeof imageObj === 'string' ? imageObj : (imageObj as any)?.url) || "https://placehold.co/600x600/f5f5f4/a8a29e.png?text=Gorsel+Yok";

  const favorite = isFavorite(firstVariant?.id || product.id);
  const inCompare = isInCompare(firstVariant?.id || product.id);

  const isDealer = user?.role === "DEALER" || user?.role === "dealer";
  const finalPrice = firstVariant ? (isDealer && firstVariant.dealerPrice ? Number(firstVariant.dealerPrice) : Number(firstVariant.price)) : Number(product.price || 0);

  const hasDemoDiscount = product.id.length % 2 === 0;
  const displayOldPrice = firstVariant?.oldPrice || (hasDemoDiscount ? finalPrice * 1.25 : null);

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
      price: finalPrice,
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
      price: finalPrice,
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white transition-all duration-700 hover:border-stone-900 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
      {/* Gorsel Alani */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-white p-8">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-8 transition duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
        />

        {/* Rozetler */}
        <div className="absolute left-8 top-8 flex flex-col gap-2 z-10">
          {isDealer && (
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Bayi Ozel Fiyat</p>
            </div>
          )}
          {displayOldPrice && (Number(displayOldPrice) > finalPrice) && (
            <>
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">BUYUK INDIRIM</p>
              </div>
              <div className="bg-green-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
                  %{Math.round(((Number(displayOldPrice) - finalPrice) / Number(displayOldPrice)) * 100)} Indirim
                </p>
              </div>
            </>
          )}
          {product.featured && (
            <div className="bg-black text-white px-4 py-1.5 rounded-full shadow-lg">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">One Cikan</p>
            </div>
          )}
        </div>

        {/* Aksiyon Butonlari */}
        <div className="absolute right-8 top-8 flex flex-col gap-2 z-10">
          <button
            onClick={handleToggleFavorite}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${favorite ? 'text-red-500' : 'text-stone-400 hover:text-stone-900'}`}
          >
            <Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsQuickViewOpen(true);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 text-stone-400 hover:text-stone-900"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCompare({
                id: firstVariant?.id || product.id,
                productId: product.id,
                productName: product.name,
                brand: product.brand,
                slug: product.slug,
                image: firstImage,
                price: finalPrice,
                category: (product as any).category?.name,
                color: firstVariant?.color,
                storage: firstVariant?.storage ?? undefined,
              });
            }}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${inCompare ? 'text-blue-600 bg-blue-50' : 'text-stone-400 hover:text-stone-900'}`}
            title="Karsilastirmaya Ekle"
          >
            <GitCompareArrows className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!firstVariant || firstVariant.stock <= 0}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 shadow-xl transition-transform hover:scale-110 ${
              !firstVariant || firstVariant.stock <= 0
                ? "opacity-50 cursor-not-allowed text-stone-200"
                : "cursor-pointer text-white"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </Link>

      {/* Icerik Alani */}
      <div className="flex flex-1 flex-col gap-4 p-10 pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{product.brand}</p>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-stone-300" />
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{viewCount} Goruntuleme</p>
            </div>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xl font-black leading-[1.1] text-stone-900 uppercase italic tracking-tighter group-hover:text-stone-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <Link href={`/products/${product.slug}#reviews`} className="flex items-center gap-1 group/rating hover:opacity-80 transition-opacity mt-1">
            <span className="text-sm font-medium text-stone-900">{rating.toFixed(1)}</span>
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          </Link>
        </div>

        {/* Fiyat Alani */}
        <div className="mt-auto pt-6 border-t border-stone-50">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Fiyat</p>
                {displayOldPrice && (Number(displayOldPrice) > finalPrice) && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Indirimde</span>
                )}
              </div>
              {displayOldPrice && (Number(displayOldPrice) > finalPrice) && (
                <span className="text-xs font-black text-stone-300 line-through decoration-red-500/50 decoration-2 group-hover:text-stone-400 transition-colors">
                  {formatPrice(Number(displayOldPrice))}
                </span>
              )}
              <span className="text-xl font-black text-stone-900 tracking-tighter group-hover:text-black transition-colors flex items-start gap-1">
                {formatPrice(finalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest italic">Yogun Talep</span>
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={product}
      />
    </div>
  );
}
