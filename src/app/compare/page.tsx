"use client";

import { useCompare } from "@/store/compare-store";
import { useCart } from "@/store/cart-store";
import { useUi } from "@/store/ui-store";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2, Check, X, Package } from "lucide-react";

const COMPARE_ROWS = [
  { key: "price", label: "Fiyat" },
  { key: "brand", label: "Marka" },
  { key: "category", label: "Kategori" },
  { key: "color", label: "Renk" },
  { key: "storage", label: "Hafıza" },
];

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();
  const { openCart } = useUi();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="flex h-28 w-28 mx-auto items-center justify-center rounded-full bg-stone-50 border-2 border-stone-100">
          <Package className="h-12 w-12 text-stone-200" />
        </div>
        <h1 className="mt-8 text-4xl font-black uppercase tracking-tighter text-stone-900">Karşılaştırma Listesi Boş</h1>
        <p className="mt-4 text-sm text-stone-400">Ürünler sayfasından ürün kartlarındaki karşılaştır butonuna tıklayın.</p>
        <Link
          href="/products"
          className="mt-10 inline-flex items-center gap-3 rounded-full border-2 border-stone-200 px-8 py-4 text-xs font-black uppercase tracking-widest text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" />
          Ürünlere Dön
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yan Yana İncele</p>
            <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Ürün Karşılaştırma</h1>
          </div>
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 rounded-full border-2 border-stone-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-stone-900 hover:border-stone-900 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Temizle
          </button>
        </div>
        <div className="mt-6 h-px bg-stone-100" />
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Product images header */}
          <thead>
            <tr>
              <th className="w-40 text-left pr-8 pb-8 text-[10px] font-black uppercase tracking-widest text-stone-400 align-bottom">
                Özellikler
              </th>
              {items.map(item => (
                <th key={item.id} className="pb-8 px-4 text-left align-top">
                  <div className="relative">
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <Link href={`/products/${item.slug}`} className="group block">
                      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-stone-50 border border-stone-100 group-hover:border-stone-900 transition-colors">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-200">
                            <Package className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-400">{item.brand}</p>
                      <h3 className="mt-1 text-base font-black uppercase tracking-tight text-stone-900 leading-tight line-clamp-2 group-hover:text-stone-600 transition-colors">
                        {item.productName}
                      </h3>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-50">
            {/* Price row */}
            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-6 pr-8 text-[11px] font-black uppercase tracking-widest text-stone-400">Fiyat</td>
              {items.map(item => (
                <td key={item.id} className="py-6 px-4">
                  <span className="text-2xl font-black tracking-tighter text-stone-900">
                    {item.price.toLocaleString("tr-TR")} ₺
                  </span>
                </td>
              ))}
            </tr>
            {/* Brand row */}
            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-6 pr-8 text-[11px] font-black uppercase tracking-widest text-stone-400">Marka</td>
              {items.map(item => (
                <td key={item.id} className="py-6 px-4 text-sm font-bold text-stone-900">{item.brand || "—"}</td>
              ))}
            </tr>
            {/* Category row */}
            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-6 pr-8 text-[11px] font-black uppercase tracking-widest text-stone-400">Kategori</td>
              {items.map(item => (
                <td key={item.id} className="py-6 px-4">
                  {item.category ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-stone-900">
                      {item.category}
                    </span>
                  ) : <span className="text-stone-300">—</span>}
                </td>
              ))}
            </tr>
            {/* Color row */}
            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-6 pr-8 text-[11px] font-black uppercase tracking-widest text-stone-400">Renk</td>
              {items.map(item => (
                <td key={item.id} className="py-6 px-4 text-sm font-bold text-stone-900">{item.color || "—"}</td>
              ))}
            </tr>
            {/* Storage row */}
            <tr className="hover:bg-stone-50/50 transition-colors">
              <td className="py-6 pr-8 text-[11px] font-black uppercase tracking-widest text-stone-400">Hafıza</td>
              {items.map(item => (
                <td key={item.id} className="py-6 px-4 text-sm font-bold text-stone-900">{item.storage || "—"}</td>
              ))}
            </tr>
            {/* CTA row */}
            <tr>
              <td className="pt-8 pr-8" />
              {items.map(item => (
                <td key={item.id} className="pt-8 px-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        addItem({
                          id: item.id,
                          productId: item.productId,
                          productName: item.productName,
                          brand: item.brand,
                          variantId: item.id,
                          color: item.color || "",
                          price: item.price,
                          image: item.image,
                          slug: item.slug,
                        });
                        openCart();
                      }}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Sepete Ekle
                    </button>
                    <Link
                      href={`/products/${item.slug}`}
                      className="flex w-full items-center justify-center rounded-full border-2 border-stone-200 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-900 hover:border-stone-900 transition-colors"
                    >
                      İncele
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
