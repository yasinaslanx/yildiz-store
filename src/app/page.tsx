import { FeatureStrip } from "@/components/product/feature-strip";
import { ProductsGrid } from "@/components/product/products-grid";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { NewsletterForm } from "@/components/ui/newsletter-form";

export const metadata: Metadata = {
   title: "Teknoloji Yeniden Tanımlandı",
   description: "YıldızStore ile premium teknoloji deneyimine adım atın. En yeni iPhone modelleri ve aksesuarları keşfedin.",
};

export default function HomePage() {
   return (
      <div className="flex flex-col gap-0 bg-white overflow-hidden">
         {/* --- HERO SECTION: SIDE BY SIDE --- */}
         <section className="relative w-full overflow-hidden bg-white py-20 lg:py-32">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-16 lg:flex-row lg:items-center px-6 lg:px-20">

               {/* Left: Text Content */}
               <div className="flex-1 space-y-10 animate-in slide-in-from-left-12 duration-1000">
                  <div className="inline-flex items-center gap-3 rounded-full border-2 border-stone-100 bg-stone-50 px-5 py-2">
                     <span className="h-2 w-2 rounded-full bg-stone-900 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Yeni Sezon Koleksiyonu</span>
                  </div>

                  <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-stone-900 md:text-8xl lg:text-[110px] uppercase">
                     Geleceği <br /> <span className="text-transparent" style={{ WebkitTextStroke: '2px #1c1917' }}>Deneyimle</span>
                  </h1>

                  <p className="max-w-md text-lg font-bold leading-relaxed text-stone-400 uppercase tracking-tight">
                     YıldızStore'un küratörlüğünü yaptığı premium teknoloji ekosistemiyle tanışın.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-6">
                     <Link
                        href="/products"
                        className="rounded-full border-2 border-black bg-white px-12 py-6 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-100"
                     >
                        Koleksiyonu Keşfet
                     </Link>
                     <Link
                        href="/products/iphone-17-pro-max"
                        className="rounded-full border-2 border-stone-200 bg-white px-12 py-6 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:border-black active:scale-95"
                     >
                        iPhone 17 Pro Max
                     </Link>
                  </div>
               </div>

               {/* Right: Phone Preview Box (The one user liked) */}
               <div className="flex-1 relative animate-in zoom-in-95 duration-1000">
                  <div className="relative aspect-square w-full max-w-[600px] mx-auto rounded-[4rem] border-2 border-stone-100 bg-stone-50/50 p-12 overflow-hidden shadow-2xl shadow-stone-100 group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0" />
                     <div className="absolute inset-0 overflow-hidden rounded-[4rem]">
                        <video
                           autoPlay
                           loop
                           muted
                           playsInline
                           className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                           src="/videos/iphone17pro-max.mp4"
                        />
                        {/* Karanlık gradyan overlay, metinlerin ve butonun okunmasını sağlar */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                     </div>
                     <div className="absolute bottom-12 right-12 flex flex-col items-end z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Model</p>
                        <p className="text-3xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">iPhone 17 Pro Max</p>
                        <Link
                           href="/products/iphone-17-pro-max"
                           className="rounded-full bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:scale-105 hover:bg-stone-100 shadow-xl"
                        >
                           Ürüne Git
                        </Link>
                     </div>
                  </div>

                  {/* Float Elements */}
                  <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full border-2 border-stone-100 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 shadow-xl animate-bounce">
                     <p className="text-center text-[10px] font-black uppercase tracking-widest text-stone-900 leading-tight">Hemen <br /> Keşfet</p>
                  </div>
               </div>
            </div>
         </section>

         {/* --- BRAND MARQUEE: SOCIAL PROOF --- */}
         <section className="border-y-2 border-stone-100 bg-white py-12">
            <div className="flex animate-marquee whitespace-nowrap overflow-hidden">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="mx-12 flex items-center gap-12 text-4xl font-black tracking-tighter text-stone-100 uppercase">
                     <span className="text-stone-200">APPLE</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100" />
                     <span className="text-stone-200">BOSE</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100" />
                     <span className="text-stone-200">SAMSUNG</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100" />
                     <span className="text-stone-200">SONY</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100" />
                     <span className="text-stone-200">MARSHALL</span>
                  </div>
               ))}
            </div>
         </section>

         {/* --- FEATURED CATEGORIES: BENTO GRID --- */}
         <section className="mx-auto w-full max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end mb-16">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Koleksiyonlar</p>
                  <h2 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Kategorileri Keşfet</h2>
               </div>
            </div>

            <div className="grid md:h-[560px] grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
               <Link href="/products?category=phones" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-100 md:col-span-2 md:row-span-2 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[420px]">
                  <Image
                     src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop"
                     alt="Telefonlar"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-12 left-12">
                     <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Akıllı Telefonlar</h3>
                     <p className="mt-2 text-xs font-bold text-white/90 uppercase tracking-widest">En yeni modelleri keşfet</p>
                  </div>
               </Link>

               <Link href="/products?category=phones" className="group relative overflow-hidden rounded-[2.5rem] md:col-span-2 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[250px]">
                  <Image
                     src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop"
                     alt="Ses Sistemleri"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                  <div className="absolute bottom-10 left-10">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Ses & Müzik</p>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Premium Ses</h3>
                     <p className="mt-2 text-xs font-bold text-white/80 uppercase tracking-widest">Kusursuz Akustik Deneyimi</p>
                  </div>
               </Link>

               <Link href="/products?category=phone-accessories" className="group relative overflow-hidden rounded-[2.5rem] md:col-span-1 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[220px]">
                  <Image
                     src="https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1200&auto=format&fit=crop"
                     alt="Aksesuarlar"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Aksesuarlar</h3>
                     <p className="mt-1 text-[10px] font-bold text-white/70 uppercase tracking-widest">Kılıf & Şarj</p>
                  </div>
               </Link>

               <div className="group relative overflow-hidden rounded-[2.5rem] md:col-span-1 shadow-sm min-h-[220px]">
                  <Image
                     src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop"
                     alt="Yıldız Lifestyle"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale"
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                     <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 text-lg mb-4">✦</span>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Çok Yakında</p>
                     <h3 className="text-lg font-black text-stone-900 uppercase tracking-tighter leading-tight">Yıldız <br />Lifestyle</h3>
                  </div>
               </div>
            </div>
         </section>

         {/* --- FEATURE STRIP: PREMIUM HORIZONTAL --- */}
         <section className="border-y-2 border-stone-100 bg-white">
            <div className="mx-auto max-w-[1440px] divide-x-2 divide-stone-100 grid md:grid-cols-4">
               {[
                  {
                     title: "Hızlı Kargo",
                     desc: "Saat 16'ya kadar aynı gün kargoda",
                     icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                           <rect x="9" y="11" width="14" height="10" rx="2" />
                           <circle cx="12" cy="21" r="1" />
                           <circle cx="20" cy="21" r="1" />
                        </svg>
                     )
                  },
                  {
                     title: "Güvenli Ödeme",
                     desc: "256-bit SSL & 3D Secure koruması",
                     icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                           <polyline points="9 12 11 14 15 10" />
                        </svg>
                     )
                  },
                  {
                     title: "Orijinal Ürün",
                     desc: "%100 Orijinal, distribütör garantili",
                     icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                     )
                  },
                  {
                     title: "Taksit İmkânı",
                     desc: "Tüm kartlara vade farksız taksit",
                     icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                           <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                     )
                  }
               ].map((f, i) => (
                  <div key={i} className="group flex items-center gap-6 px-10 py-10 hover:bg-stone-50 transition-all duration-300 cursor-default border-b-4 border-transparent hover:border-stone-900">
                     <div className="flex-shrink-0 h-14 w-14 rounded-2xl border-2 border-stone-200 bg-stone-50 group-hover:border-stone-900 group-hover:bg-white flex items-center justify-center text-stone-600 group-hover:text-stone-900 transition-all duration-300">
                        {f.icon}
                     </div>
                     <div>
                        <p className="text-sm font-black uppercase tracking-tight text-stone-900">{f.title}</p>
                        <p className="mt-1 text-[11px] font-bold text-stone-400 leading-snug">{f.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* --- LIFESTYLE: LIGHT THEME --- */}
         <section className="relative h-[600px] w-full overflow-hidden">
            <Image
               src="https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2000&auto=format&fit=crop"
               alt="Lifestyle"
               fill
               className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
            <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col justify-center px-6 text-center text-stone-900">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Deneyim</span>
               <h2 className="mt-8 text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                  "Teknoloji yaşam tarzınızın bir <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #1c1917' }}>yansımasıdır.</span>"
               </h2>
               <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white shadow-xl overflow-hidden">
                     <div className="h-full w-full bg-stone-200" />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-stone-900">Yasin Yıldız</p>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Kurucu, YıldızStore</p>
                  </div>
               </div>
            </div>
         </section>

         {/* --- TRENDING PRODUCTS --- */}
         <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-20 lg:py-40">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end mb-16">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Trendler</p>
                  <h2 className="text-5xl font-black tracking-tighter text-stone-900 uppercase">Sizin İçin Seçtiklerimiz</h2>
               </div>
            </div>
            <ProductsGrid recommendationMode={true} />
         </section>

         {/* --- NEWSLETTER: BOLD LIGHT --- */}
         <section className="mx-auto max-w-[1440px] px-6 pb-24 lg:px-20 lg:pb-40">
            <div className="relative overflow-hidden rounded-[4rem] border-2 border-stone-100 bg-white p-12 md:p-24 lg:p-32 text-center shadow-2xl shadow-stone-100">
               <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900 uppercase">Dünyamıza <br /> Katılın</h2>
                  <p className="text-sm font-bold text-stone-900 uppercase tracking-widest leading-relaxed">Özel indirimlerden ilk siz haberdar olun.</p>

                  <NewsletterForm variant="bold" />
               </div>
            </div>
         </section>
      </div>
   );
}
