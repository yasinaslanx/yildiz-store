"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ProductGalleryProps = {
  images: { url: string }[] | string[];
  alt: string;
};

const PLACEHOLDER = "/placeholder.png";

function getUrl(img: { url: string } | string): string {
  if (!img) return PLACEHOLDER;
  if (typeof img === "string") return img || PLACEHOLDER;
  return img.url || PLACEHOLDER;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const urls = (images || []).map(getUrl).filter(Boolean);
  const [activeImage, setActiveImage] = useState(urls[0] || PLACEHOLDER);

  // Varyant değiştiğinde (images prop'u değiştiğinde) aktif resmi güncelle
  useEffect(() => {
    if (urls.length > 0) {
      setActiveImage(urls[0]);
    }
  }, [images]);

  if (urls.length === 0) {
    return (
      <div className="rounded-[3rem] border border-stone-100 bg-stone-50/30 p-12 aspect-[4/5] flex items-center justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Görsel Mevcut Değil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-12">
      {/* Ana Görsel Alanı */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl shadow-stone-100/50 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <Image
              src={activeImage}
              alt={alt}
              fill
              priority
              className="object-contain p-12 transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Zarif Rozetler (Türkçe) */}
        <div className="absolute top-10 left-10 flex flex-col gap-3 z-10">
           <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="bg-black text-white px-6 py-2 rounded-full shadow-2xl"
           >
             <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">En Çok Satan</p>
           </motion.div>

           <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="bg-white/90 backdrop-blur-md border border-stone-100 px-6 py-2 rounded-full shadow-lg"
           >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 leading-none">Amiral Gemisi Serisi</p>
           </motion.div>
        </div>

        <div className="absolute bottom-10 right-10">
           <div className="bg-stone-900 text-white px-5 py-2 rounded-full shadow-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">YıldızStore Özel</p>
           </div>
        </div>
      </div>

      {/* Thumbnails */}
      {urls.length > 1 && (
        <div className="flex flex-wrap gap-6 px-4">
          {urls.map((url, i) => (
            <motion.button
              key={url}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveImage(url)}
              className={`relative h-28 w-24 overflow-hidden rounded-3xl border-2 transition-all duration-700 ${
                activeImage === url
                  ? "border-black shadow-2xl scale-110 z-10"
                  : "border-stone-100 hover:border-stone-400 grayscale-[0.3] hover:grayscale-0"
              } bg-white`}
            >
              <Image
                src={url}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-contain p-4"
              />
              {activeImage === url && (
                <motion.div 
                  layoutId="activeThumb"
                  className="absolute inset-0 border-[3px] border-black rounded-3xl z-10"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
