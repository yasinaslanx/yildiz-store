"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart-store";

export default function CartPage() {
  const {
    items,
    removeItem,
    increaseItem,
    decreaseItem,
    totalPrice,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 py-20 lg:px-20 text-center">
        <div className="rounded-[3rem] border-2 border-stone-100 bg-stone-50 p-24">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-stone-200 bg-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Sepetiniz Boş</h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-stone-400">Keşfetmeye devam edin, harika ürünler sizi bekliyor.</p>
          <Link href="/products" className="mt-10 inline-block rounded-full border-2 border-black bg-white px-12 py-5 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-100">
            Alışverişe Başla
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-20 lg:py-20">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Alışveriş</p>
        <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Sepetim</h1>
        <p className="mt-3 text-sm font-bold text-stone-400 uppercase tracking-widest">{items.length} ürün seçildi</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="group rounded-[2.5rem] border-2 border-stone-100 bg-white p-8 transition-all hover:border-stone-200 hover:shadow-xl hover:shadow-stone-100">
              <div className="flex items-center gap-8">
                {/* Product Image */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-stone-100 bg-stone-50 p-3">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.productName}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">{item.brand}</p>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-stone-900 uppercase">{item.productName}</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-stone-400">
                    {item.color}{item.storage ? ` · ${item.storage}` : ""}
                  </p>
                  <p className="mt-3 text-xl font-black tracking-tighter text-stone-900">
                    {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] font-bold text-stone-400">{item.price.toLocaleString("tr-TR")} ₺ / adet</p>
                  )}
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-1 rounded-2xl border-2 border-stone-100 bg-stone-50 p-1">
                  <button
                    onClick={() => decreaseItem(item.id)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-stone-600 transition hover:bg-white hover:text-stone-900 font-black text-lg"
                  >
                    −
                  </button>
                  <span className="min-w-[32px] text-center text-sm font-black text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => increaseItem(item.id)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-stone-600 transition hover:bg-white hover:text-stone-900 font-black text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove */}
              <div className="mt-6 flex items-center justify-between pl-32">
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex cursor-pointer items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 transition hover:text-red-500 group-hover:text-stone-500"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Kaldır
                </button>
                <Link
                  href={`/products/${item.slug ?? ""}`}
                  className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition underline underline-offset-4 decoration-2"
                >
                  Ürünü Gör
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="h-fit sticky top-24 rounded-[2.5rem] border-2 border-stone-100 bg-stone-50 p-10 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Özet</p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tighter text-stone-900">Sipariş Özeti</h2>
          </div>

          <div className="space-y-4 border-y-2 border-stone-200 py-8">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Ara Toplam</span>
              <span className="text-sm font-black text-stone-900">{totalPrice.toLocaleString("tr-TR")} ₺</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Kargo</span>
              <span className="text-xs font-black text-green-600">ÜCRETSİZ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">İndirim</span>
              <span className="text-xs font-black text-stone-400">—</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-lg font-black uppercase tracking-tighter text-stone-900">Toplam</span>
            <span className="text-3xl font-black tracking-tighter text-stone-900">{totalPrice.toLocaleString("tr-TR")} ₺</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-full border-2 border-black bg-white py-6 text-center text-xs font-black uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-100"
          >
            Ödemeye Geç
          </Link>

          <div className="flex items-center gap-3 justify-center pt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">SSL Korumalı Güvenli Ödeme</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
