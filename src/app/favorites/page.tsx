"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/store/favorites-store";

export default function FavoritesPage() {
  const { items, toggleFavorite } = useFavorites();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Favorilerim</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
          Henüz favori ürün yok.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <p className="mt-5 text-sm text-stone-500">{item.brand}</p>
              <h2 className="mt-1 text-xl font-semibold">{item.productName}</h2>
              <div className="mt-4 text-lg font-semibold">
                {item.price.toLocaleString("tr-TR")}₺
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                >
                  Ürüne Git
                </Link>
                <button
                  onClick={() => toggleFavorite(item)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm"
                >
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
