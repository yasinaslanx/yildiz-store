"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Percent, ShoppingBag, Clock, ArrowRight } from "lucide-react";

export default function DealerPortalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/bayi-girisi");
      } else if (user.role !== "DEALER" && user.role !== "ADMIN") {
        router.push("/dealer-application");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="mb-12">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Sunix B2B</p>
         <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-stone-900 uppercase">Bayi Portalı</h1>
         <p className="mt-4 text-stone-500 font-medium">Hoş geldiniz {user.firstName}. Size özel avantajlar, kampanyalar ve erken erişim ürünleri burada.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Hızlı Sipariş */}
        <Link href="/products" className="group bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl shadow-stone-100/50 hover:border-blue-200 hover:shadow-blue-900/5 transition-all">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-stone-900 mb-2">Tüm Ürünler</h2>
          <p className="text-xs font-bold text-stone-400 mb-8 line-clamp-2">Bayi fiyatlarıyla tüm ürün kataloğumuzu inceleyin ve hızlıca sipariş verin.</p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
             Sipariş Ver <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card 2: Erken Erişim */}
        <Link href="/products?earlyAccess=true" className="group bg-gradient-to-br from-stone-900 to-stone-800 rounded-[2.5rem] p-8 border border-stone-800 shadow-xl shadow-stone-900/20 hover:border-stone-600 transition-all">
          <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Erken Erişim</h2>
          <p className="text-xs font-medium text-stone-400 mb-8 line-clamp-2">Sadece bayilerimize özel, henüz piyasaya sürülmemiş yeni ürünleri ilk siz görün.</p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-400">
             Ürünleri İncele <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card 3: Toplu İndirim Talepleri */}
        <Link href="/hesabim/siparisler" className="group bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl shadow-stone-100/50 hover:border-blue-200 hover:shadow-blue-900/5 transition-all">
          <div className="h-14 w-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
            <Percent className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-stone-900 mb-2">İndirim Talepleri</h2>
          <p className="text-xs font-bold text-stone-400 mb-8 line-clamp-2">Sepetinizdeki toplu alımlar için oluşturduğunuz indirim taleplerinin durumunu takip edin.</p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
             Taleplerimi Gör <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <div className="mt-16 bg-blue-50 border border-blue-100 rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row gap-8 items-center justify-between text-center lg:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        
        <div className="max-w-xl z-10">
          <h3 className="text-2xl font-black tracking-tight text-blue-900 uppercase mb-4">Toplu Alımlarda İndirim Fırsatı!</h3>
          <p className="text-sm font-medium text-blue-800/80 leading-relaxed">
            Yüksek adetli alımlarınızda sepete giderek <strong>"Toplu Alım İçin İndirim İste"</strong> butonuna basabilirsiniz. 
            Talebiniz uzman satış ekibimize anında ulaşır ve size özel bir fiyat teklifi sunulur.
          </p>
        </div>
        <div className="z-10 flex-shrink-0">
           <Link href="/products" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-900/20">
             Alışverişe Başla
           </Link>
        </div>
      </div>
    </div>
  );
}
