"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Tag, Flame } from "lucide-react";

type Offer = {
  id: string;
  title: string | null;
  minQuantity: number;
  specialPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string }[];
    variants?: { wholesalePrice: number | null, price: number }[];
  };
};

export function DealerOffersCards() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dealer-offers")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setOffers(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full flex gap-4 overflow-hidden mb-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[300px] h-48 bg-stone-50 animate-pulse rounded-[2rem] border border-stone-100 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <Flame className="w-5 h-5 fill-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900 uppercase">Sadece Size Özel Fırsatlar</h2>
          <p className="text-sm text-stone-500 font-medium">Toplu alımlarda geçerli dev indirimleri kaçırmayın</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        {offers.map(offer => {
          const basePrice = offer.product.variants?.[0]?.wholesalePrice || offer.product.variants?.[0]?.price || 0;
          const isDiscounted = basePrice > offer.specialPrice;
          const discountPercent = isDiscounted ? Math.round(((basePrice - offer.specialPrice) / basePrice) * 100) : 0;

          return (
            <Link 
              href={`/products/${offer.product.slug}`} 
              key={offer.id}
              className="group relative flex-shrink-0 w-[340px] md:w-[400px] bg-white rounded-[2.5rem] p-6 border-2 border-red-100 shadow-xl shadow-red-900/5 hover:border-red-300 hover:shadow-red-900/10 transition-all snap-start overflow-hidden flex flex-col"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500 to-orange-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              {offer.title && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    {offer.title}
                  </span>
                </div>
              )}

              <div className="flex gap-5 mb-5 mt-8">
                <div className="w-24 h-24 rounded-2xl bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0 relative">
                  {offer.product.images[0] ? (
                    <img src={offer.product.images[0].url} alt={offer.product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><Tag className="w-8 h-8" /></div>
                  )}
                  {isDiscounted && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-[10px] font-black uppercase">
                      %{discountPercent} İndirim
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-stone-900 line-clamp-2 leading-snug mb-2 group-hover:text-red-600 transition-colors">
                    {offer.product.name}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {isDiscounted && (
                      <span className="text-[11px] font-bold text-stone-400 line-through decoration-red-500/50">
                        Normal: {Number(basePrice).toLocaleString("tr-TR")} TL
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-red-600 tracking-tight">
                        {Number(offer.specialPrice).toLocaleString("tr-TR")} ₺
                      </span>
                      <span className="text-[10px] font-bold text-red-600/70 uppercase">/adet</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-red-50 rounded-2xl p-4 flex items-center justify-between border border-red-100/50">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-800/60 mb-0.5">Geçerlilik Şartı</p>
                  <p className="font-bold text-red-900 text-sm">{offer.minQuantity} Adet ve Üzeri Alımlarda</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
