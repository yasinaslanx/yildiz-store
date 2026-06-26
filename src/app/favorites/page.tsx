"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/store/favorites-store";
import { useCart } from "@/store/cart-store";
import { useUi } from "@/store/ui-store";
import { Heart, ShoppingCart, ArrowRight, Trash2, Package } from "lucide-react";

export default function FavoritesPage() {
  const { items, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const { openCart } = useUi();

  function handleAddToCart(item: typeof items[0]) {
    addItem({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      variantId: item.id,
      color: "",
      price: item.price,
      image: item.image,
      slug: item.slug,
    });
    openCart();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Koleksiyonunuz</p>
        <div className="mt-4 flex items-end justify-between">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-stone-900 uppercase leading-[0.9]">
            Favorilerim
          </h1>
          {items.length > 0 && (
            <span className="text-sm font-black text-stone-400 uppercase tracking-widest">
              {items.length} Ürün
            </span>
          )}
        </div>
        <div className="mt-6 h-px bg-stone-100" />
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="relative mb-8">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-stone-50 border-2 border-stone-100">
              <Heart className="h-12 w-12 text-stone-200" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white">
              <span className="text-xs font-black">0</span>
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-stone-900 uppercase">
            Henüz Favori Yok
          </h2>
          <p className="mt-4 max-w-sm text-sm font-medium text-stone-400">
            Beğendiğiniz ürünlerin kalbine tıklayarak buraya ekleyebilirsiniz.
          </p>
          <Link
            href="/products"
            className="mt-10 group inline-flex items-center gap-3 rounded-full bg-stone-950 px-8 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
          >
            Ürünleri Keşfet
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-stone-100 bg-white transition-all duration-500 hover:border-stone-900 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]"
            >
              {/* Remove Button */}
              <button
                onClick={() => toggleFavorite(item)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-stone-100 text-red-400 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hover:scale-110"
                title="Favorilerden Kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Heart Badge */}
              <div className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <Heart className="h-4 w-4 fill-red-400 text-red-400" />
              </div>

              {/* Image */}
              <Link href={`/products/${item.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-stone-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-200">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{item.brand}</p>
                <Link href={`/products/${item.slug}`}>
                  <h2 className="mt-2 text-base font-black uppercase tracking-tight text-stone-900 leading-tight line-clamp-2 hover:text-stone-600 transition-colors">
                    {item.productName}
                  </h2>
                </Link>

                <div className="mt-auto pt-6 space-y-3">
                  <p className="text-2xl font-black tracking-tighter text-stone-900">
                    {item.price.toLocaleString("tr-TR")} <span className="text-lg">₺</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="group/btn flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Sepete Ekle
                    </button>
                    <Link
                      href={`/products/${item.slug}`}
                      className="flex items-center justify-center rounded-full border-2 border-stone-200 px-4 py-3.5 text-stone-900 transition-all hover:border-stone-900"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
