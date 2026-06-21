"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";

type DealerOffer = {
  id: string;
  minQuantity: number;
  specialPrice: number;
  title: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
    variants?: { wholesalePrice: number | null, price: number }[];
  };
};

export function DealerOffersBanner() {
  const [offers, setOffers] = useState<DealerOffer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/dealer-offers");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setOffers(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dealer offers", err);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  if (offers.length === 0) return null;

  const currentOffer = offers[currentIndex];
  
  const basePrice = currentOffer.product.variants?.[0]?.wholesalePrice || currentOffer.product.variants?.[0]?.price || 0;
  const isDiscounted = basePrice > currentOffer.specialPrice;
  const discountPercent = isDiscounted ? Math.round(((basePrice - currentOffer.specialPrice) / basePrice) * 100) : 0;

  return (
    <div className="w-full bg-blue-600 text-white overflow-hidden relative border-b-4 border-blue-800">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md hidden md:flex shrink-0 animate-pulse">
            <Tag className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="flex flex-col text-center md:text-left transition-all duration-500 w-full" key={currentOffer.id}>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-0.5">Bayi Özel Teklifi</span>
            <p className="text-sm md:text-base font-bold leading-tight">
              {currentOffer.title ? (
                <span className="mr-2">{currentOffer.title}</span>
              ) : (
                <span className="mr-2">Sadece Bayilere Özel İndirim!</span>
              )}
              <span className="font-black text-yellow-300">
                {currentOffer.product.name}
              </span>
              <span> ürününde </span>
              <span className="underline decoration-2 underline-offset-4 decoration-yellow-400">
                {currentOffer.minQuantity} adet ve üzeri
              </span>
              <span> alımlarda birim fiyat sadece </span>
              {isDiscounted && (
                <span className="line-through text-yellow-300/60 ml-1 decoration-red-500">
                  {Number(basePrice).toLocaleString("tr-TR")} TL
                </span>
              )}
              <span className="bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-md font-black ml-1 shadow-sm">
                {Number(currentOffer.specialPrice).toLocaleString("tr-TR")} TL
              </span>
              {isDiscounted && (
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-white bg-red-500 px-1.5 py-0.5 rounded shadow-sm">
                  %{discountPercent} İNDİRİM
                </span>
              )}
            </p>
          </div>
        </div>

        <Link 
          href={`/products/${currentOffer.product.slug}`}
          className="shrink-0 group flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-blue-900 transition-all shadow-lg active:scale-95"
        >
          Fırsatı İncele
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
