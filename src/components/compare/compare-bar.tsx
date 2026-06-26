"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/store/compare-store";
import { useRouter } from "next/navigation";
import { X, GitCompareArrows, Package } from "lucide-react";

export function CompareBar() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-full max-w-3xl px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[2rem] border border-stone-200 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] p-4">
        <div className="flex items-center gap-4">
          {/* Products */}
          <div className="flex flex-1 items-center gap-3">
            {items.map(item => (
              <div key={item.id} className="relative flex items-center gap-2 rounded-2xl border border-stone-100 bg-stone-50 p-2 pr-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-1 mix-blend-multiply" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-200">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="max-w-[100px] truncate text-[10px] font-black uppercase tracking-tight text-stone-900 hidden sm:block">
                  {item.productName}
                </p>
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-stone-500 hover:bg-red-100 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div key={i} className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-stone-200 flex-shrink-0">
                <Package className="h-5 w-5" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors px-2"
            >
              Temizle
            </button>
            <button
              onClick={() => router.push("/compare")}
              disabled={items.length < 2}
              className="group flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <GitCompareArrows className="h-4 w-4" />
              Karşılaştır
              {items.length >= 2 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-stone-950 text-[10px] font-black">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
