"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Percent, ShoppingBag, Clock, ArrowRight, Trophy, TrendingUp, Zap, ChevronRight } from "lucide-react";

type TierData = {
  tier: "BRONZE" | "SILVER" | "GOLD";
  discountPercent: number;
  monthlyRevenue: number;
  nextTier: string | null;
  nextTierThreshold: number;
  progress: number;
  remaining: number;
};

const TIER_CONFIG = {
  BRONZE: {
    label: "Bronze Bayi",
    emoji: "🥉",
    color: "from-amber-700 to-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    description: "Standart bayi fiyatlarından yararlanıyorsunuz.",
  },
  SILVER: {
    label: "Silver Bayi",
    emoji: "🥈",
    color: "from-slate-500 to-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-800",
    badge: "bg-slate-100 text-slate-700",
    bar: "bg-slate-500",
    description: "Toptan fiyattan ek %3 indirim kazandınız!",
  },
  GOLD: {
    label: "Gold Bayi",
    emoji: "🥇",
    color: "from-yellow-500 to-amber-400",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-900",
    badge: "bg-yellow-100 text-yellow-700",
    bar: "bg-yellow-500",
    description: "En yüksek ayrıcalık! Toptan fiyattan ek %7 indirim!",
  },
};

export default function DealerPortalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/bayi-girisi");
      } else if (user.role !== "DEALER" && user.role !== "ADMIN") {
        router.push("/dealer-application");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "DEALER" || user?.role === "ADMIN") {
      fetch("/api/bayi/tier")
        .then(r => r.json())
        .then(json => { if (json.success) setTierData(json.data); })
        .finally(() => setTierLoading(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tierCfg = tierData ? TIER_CONFIG[tierData.tier] : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Sunix B2B</p>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-stone-900 uppercase">Bayi Portalı</h1>
        <p className="mt-4 text-stone-500 font-medium">Hoş geldiniz {user.firstName}. Size özel avantajlar, kampanyalar ve erken erişim ürünleri burada.</p>
      </header>

      {/* Tier Card */}
      {!tierLoading && tierData && tierCfg ? (
        <div className={`mb-10 rounded-[2.5rem] border-2 ${tierCfg.border} ${tierCfg.bg} p-8 lg:p-10 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${tierCfg.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none`} />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`text-5xl`}>{tierCfg.emoji}</div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${tierCfg.text} opacity-70 mb-1`}>Mevcut Kademeniz</p>
                <h2 className={`text-3xl font-black tracking-tighter ${tierCfg.text}`}>{tierCfg.label}</h2>
                <p className={`text-sm font-medium ${tierCfg.text} opacity-80 mt-1`}>{tierCfg.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {tierData.discountPercent > 0 && (
                <div className={`rounded-2xl px-6 py-4 text-center ${tierCfg.badge} border ${tierCfg.border}`}>
                  <p className="text-2xl font-black">+%{tierData.discountPercent}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-0.5">Ek İndirim</p>
                </div>
              )}
              <div className={`rounded-2xl px-6 py-4 text-center ${tierCfg.badge} border ${tierCfg.border}`}>
                <p className="text-2xl font-black">{tierData.monthlyRevenue.toLocaleString("tr-TR")} ₺</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5">Bu Ay Alışveriş</p>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {tierData.nextTier && (
            <div className="relative z-10 mt-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${tierCfg.text}`} />
                  <p className={`text-xs font-black ${tierCfg.text}`}>
                    {TIER_CONFIG[tierData.nextTier as keyof typeof TIER_CONFIG]?.label} için gereken
                  </p>
                </div>
                <p className={`text-xs font-black ${tierCfg.text}`}>
                  {tierData.remaining > 0
                    ? `${tierData.remaining.toLocaleString("tr-TR")} ₺ daha al!`
                    : "Bir sonraki güncellemede yükseleceksiniz!"}
                </p>
              </div>
              <div className="h-3 rounded-full bg-white/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${tierCfg.bar} transition-all duration-1000`}
                  style={{ width: `${tierData.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className={`text-[10px] font-bold ${tierCfg.text} opacity-60`}>{tierCfg.label}</p>
                <p className={`text-[10px] font-bold ${tierCfg.text} opacity-60`}>{TIER_CONFIG[tierData.nextTier as keyof typeof TIER_CONFIG]?.label}</p>
              </div>
            </div>
          )}

          {tierData.tier === "GOLD" && (
            <div className="relative z-10 mt-6 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-black text-yellow-800">Tebrikler! En yüksek bayi kademesine ulaştınız. 🎉</p>
            </div>
          )}
        </div>
      ) : tierLoading ? (
        <div className="mb-10 h-48 rounded-[2.5rem] bg-stone-50 animate-pulse border border-stone-100" />
      ) : null}

      {/* Quick access grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Tier Advantages Table */}
      <div className="mt-12 rounded-[2.5rem] border border-stone-100 bg-white p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-5 h-5 text-stone-900" />
          <h3 className="text-xl font-black tracking-tighter text-stone-900 uppercase">Bayi Kademesi Avantajları</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left py-3 pr-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Kademe</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Aylık Alım</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Ek İndirim</th>
                <th className="text-center py-3 px-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {[
                { tier: "BRONZE", range: "0 – 5.000 ₺", discount: "0%", emoji: "🥉" },
                { tier: "SILVER", range: "5.000 – 20.000 ₺", discount: "+%3", emoji: "🥈" },
                { tier: "GOLD", range: "20.000 ₺ ve üzeri", discount: "+%7", emoji: "🥇" },
              ].map(row => (
                <tr key={row.tier} className={`transition-colors ${tierData?.tier === row.tier ? "bg-stone-50 font-bold" : ""}`}>
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{row.emoji}</span>
                      <span className="font-black text-stone-900">{TIER_CONFIG[row.tier as keyof typeof TIER_CONFIG].label}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-stone-600 font-medium">{row.range}</td>
                  <td className="text-center py-4 px-4 font-black text-stone-900">{row.discount}</td>
                  <td className="text-center py-4 px-4">
                    {tierData?.tier === row.tier ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                        ✓ Mevcut Kademeniz
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-200 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blue CTA Section */}
      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-[3rem] p-10 lg:p-16 flex flex-col lg:flex-row gap-8 items-center justify-between text-center lg:text-left relative overflow-hidden">
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
