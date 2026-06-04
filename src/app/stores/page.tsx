"use client";

import { Store, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StoresPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-white px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Animated Icon Container */}
          <div className="relative">
            <div className="absolute -inset-4 bg-stone-100 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative h-24 w-24 rounded-[2rem] bg-stone-900 flex items-center justify-center shadow-2xl shadow-stone-200">
              <Store className="w-10 h-10 text-white" />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white border-4 border-stone-50 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-stone-900" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
              Genişleyen Ağımız
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter">
              Çok Yakında <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-400">Hizmetinizdeyiz</span>
            </h1>
            <p className="text-stone-500 font-medium max-w-md mx-auto leading-relaxed">
              Sizlere daha iyi ve daha hızlı hizmet verebilmek için Türkiye'nin dört bir yanında yeni mağazalarımızla çok yakında buluşuyoruz. Fiziksel deneyim merkezlerimiz için hazırlıklarımız tüm hızıyla devam ediyor.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-8 h-14 text-xs font-black uppercase tracking-widest text-stone-900 transition-all hover:bg-stone-200 hover:scale-105 active:scale-95"
          >
            Alışverişe Devam Et <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
