"use client";

import { useCart } from "@/store/cart-store";
import { useUi } from "@/store/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, Trash2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MiniCart() {
  const { items, totalPrice, increaseItem, decreaseItem, removeItem } = useCart();
  const { isCartOpen, closeCart } = useUi();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-50">
                  <ShoppingBag className="h-5 w-5 text-stone-900" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-stone-900">Sepetim</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {items.length} Ürün Bulunuyor
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              {items.length > 0 ? (
                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.id} className="group flex gap-6">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 p-2">
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.productName}
                          fill
                          className="object-contain p-2 transition duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-black uppercase tracking-tight text-stone-900">
                              {item.productName}
                            </h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="cursor-pointer text-stone-300 transition hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {item.color} {item.storage ? `/ ${item.storage}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full border border-stone-100 bg-stone-50 p-1">
                            <button
                              onClick={() => decreaseItem(item.id)}
                              className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition hover:bg-white hover:text-stone-900"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-[10px] font-black text-stone-900 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseItem(item.id)}
                              className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition hover:bg-white hover:text-stone-900"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-black tracking-tighter text-stone-900 italic">
                            {(item.price * item.quantity).toLocaleString()} ₺
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-stone-50">
                    <ShoppingBag className="h-8 w-8 text-stone-200" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-stone-900">Sepetiniz Boş</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                    Mağazadaki premium ürünleri <br /> keşfetmeye ne dersiniz?
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-8 rounded-full border-2 border-stone-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50"
                  >
                    Alışverişe Başla
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-stone-100 p-8 space-y-6">
                <div className="flex items-end justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Toplam Tutar</p>
                  <p className="text-3xl font-black tracking-tighter text-stone-900 italic">
                    {totalPrice.toLocaleString()} ₺
                  </p>
                </div>
                <div className="grid gap-3">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="cursor-pointer flex items-center justify-center rounded-full border-2 border-stone-900 bg-white py-6 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95"
                  >
                    Sepete Git
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="cursor-pointer group relative flex items-center justify-center rounded-full border-2 border-stone-900 bg-white py-7 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-100"
                  >
                    Ödemeye Geç
                    <ArrowRight className="absolute right-8 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
