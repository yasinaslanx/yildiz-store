import { FeatureStrip } from "@/components/product/feature-strip";
import { ProductsGrid } from "@/components/product/products-grid";
import { SunixLogo } from "@/components/layout/sunix-logo";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { NewsletterForm } from "@/components/ui/newsletter-form";

export const metadata: Metadata = {
   title: "Teknoloji Yeniden Tanımlandı",
   description: "Sunix Store ile premium teknoloji deneyimine adım atın. En yeni Sunix ürünleri ve aksesuarları keşfedin.",
};

export default function HomePage() {
   return (
      <div className="flex flex-col gap-0 bg-white overflow-hidden transition-colors duration-500">
         {/* --- HERO SECTION: SIDE BY SIDE --- */}
         <section className="relative w-full overflow-hidden bg-white py-20 lg:py-32 transition-colors duration-500">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-16 lg:flex-row lg:items-center px-6 lg:px-20">

               {/* Left: Text Content */}
               <div className="flex-1 space-y-10 animate-in slide-in-from-left-12 duration-1000">
                  <div className="inline-flex items-center gap-3 rounded-full border-2 border-stone-100 bg-stone-50 px-5 py-2">
                     <span className="h-2 w-2 rounded-full bg-stone-900 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Yeni Sezon Koleksiyonu</span>
                  </div>

                  <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-stone-900 md:text-8xl lg:text-[110px] uppercase">
                     Geleceği <br /> <span className="text-stone-400">Deneyimle</span>
                  </h1>

                  <p className="max-w-md text-lg font-bold leading-relaxed text-stone-400 uppercase tracking-tight">
                     Sunix Store'un küratörlüğünü yaptığı premium teknoloji ekosistemiyle tanışın.
                  </p>

                  <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                     <Link
                        href="/products"
                        className="group flex items-center gap-4 rounded-full border-2 border-black bg-white px-12 py-6 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-200/50"
                     >
                        Koleksiyonu Keşfet
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
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
         <section className="border-y-2 border-stone-100 bg-white py-12 overflow-hidden transition-colors duration-500">
            <div className="flex animate-marquee whitespace-nowrap">
               {[1, 2].map((i) => (
                  <div key={i} className="flex flex-shrink-0 items-center gap-16 px-16 text-4xl font-black tracking-tighter text-stone-200 uppercase">
                     <span>APPLE</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>BOSE</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>SAMSUNG</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>SONY</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>MARSHALL</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>JBL</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>SUNIX</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
                     <span>XIAOMI</span>
                     <span className="h-3 w-3 rounded-full bg-stone-100 flex-shrink-0" />
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
               <Link href="/products?category=telefonlar" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-100 md:col-span-2 md:row-span-2 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[420px]">
                  <Image
                     src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop"
                     alt="Telefonlar"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-12 left-12 transform transition-transform duration-700 group-hover:-translate-y-2">
                     <h3 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Akıllı Telefonlar</h3>
                     <p className="mt-2 text-xs font-bold text-white/90 uppercase tracking-widest">En yeni modelleri keşfet</p>
                  </div>
               </Link>

               <Link href="/products?category=ses-muzik" className="group relative overflow-hidden rounded-[2.5rem] md:col-span-2 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[250px]">
                  <Image
                     src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop"
                     alt="Ses Sistemleri"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                  <div className="absolute bottom-10 left-10 transform transition-transform duration-700 group-hover:-translate-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Ses & Müzik</p>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Premium Ses</h3>
                     <p className="mt-2 text-xs font-bold text-white/80 uppercase tracking-widest">Kusursuz Akustik Deneyimi</p>
                  </div>
               </Link>

               <Link href="/products?category=aksesuarlar" className="group relative overflow-hidden rounded-[2.5rem] md:col-span-1 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[220px]">
                  <Image
                     src="https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=1200&auto=format&fit=crop"
                     alt="Aksesuarlar"
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                  <div className="absolute bottom-8 left-8 transform transition-transform duration-700 group-hover:-translate-y-2">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-xl">Aksesuarlar</h3>
                     <p className="mt-1 text-[10px] font-bold text-white/70 uppercase tracking-widest">Kılıf & Şarj</p>
                  </div>
               </Link>

               <Link href="/dealer-application" className="group relative overflow-hidden rounded-[2.5rem] md:col-span-1 shadow-sm hover:shadow-2xl transition-all duration-700 min-h-[220px] bg-white border-2 border-stone-100 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700 group-hover:scale-110 transform">
                     <SunixLogo asLink={false} style={{ fontSize: "10rem" }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 transform transition-transform duration-700 group-hover:-translate-y-2">
                     <div className="mb-4 rounded-full bg-stone-100 p-3 border border-stone-200">
                        <svg className="w-6 h-6 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter leading-tight drop-shadow-sm">Bayilik <br/> Başvurusu</h3>
                     <p className="mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ailemize Katılın</p>
                  </div>
               </Link>
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
                  "Teknoloji yaşam tarzınızın bir <span className="text-stone-400">yansımasıdır.</span>"
               </h2>
               <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-stone-50 shadow-xl overflow-hidden hover:scale-110 transition-transform duration-500">
                     <SunixLogo asLink={false} style={{ fontSize: "1.8rem" }} />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-stone-900">Yasin Yıldız</p>
                     <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest mt-0.5">Kurucu, Sunix Store</p>
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
            <div className="relative overflow-hidden rounded-[4rem] border-2 border-stone-100 bg-white p-12 md:p-24 lg:p-32 text-center shadow-2xl shadow-stone-100 transition-colors duration-500">
               <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900 uppercase">Dünyamıza <br /> Katılın</h2>
                  <p className="text-sm font-bold text-stone-900 uppercase tracking-widest leading-relaxed">Özel indirimlerden ilk siz haberdar olun.</p>

                  <NewsletterForm variant="bold" />
               </div>
            </div>
         </section>

         {/* --- WRAITH STYLE TRUST BADGES --- */}
         <section className="border-t border-stone-100 bg-stone-50 py-16 lg:py-24">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-20">
               <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 text-center">
                  {[
                     {
                        title: "Memnuniyet Garantisi",
                        desc: "Sunix markasını taşıyan ürünlerde memnuniyet garantisi sunuyoruz. Eğer aldığınız ürün sizi memnun edemediyse para iadesi yapıyoruz.",
                        icon: (
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        )
                     },
                     {
                        title: "Ulaşılabilir Müşteri Hizmetleri",
                        desc: "Ürünlerinizle ilgili herhangi bir sorun yaşadığınızda bize e-mail veya Instagram iletişim kanallarından ulaşabilirsiniz. Teknik destek talepleriniz için destek@sunixstore.com adresimize e-mail gönderebilirsiniz.",
                        icon: (
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                        )
                     },
                     {
                        title: "Kötü Ürün Garantisi",
                        desc: "Eğer elinize gelen ürünün defolu olduğunu düşünüyorsanız bizimle iletişime geçebilirsiniz. Paketinden defolu olarak çıkan her ürün için iade garantisi veriyoruz. Bu süreci olabildiğince hızlı gerçekleştiriyoruz.",
                        icon: (
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                        )
                     },
                     {
                        title: "Güvenli Ödeme",
                        desc: "Iyzico güvencesi ile ödeme bilgileriniz tarafımıza ulaşmaz ve ödeme işlemi %100 güvenli olarak gerçekleşir.",
                        icon: (
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        )
                     }
                  ].map((f, i) => (
                     <div key={i} className="flex flex-col items-center">
                        <div className="mb-4 text-stone-900">
                           {f.icon}
                        </div>
                        <h3 className="mb-3 text-lg font-black tracking-tight text-stone-900">{f.title}</h3>
                        <p className="text-sm font-medium leading-relaxed text-stone-500 max-w-sm">{f.desc}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* --- FAQ SECTION --- */}
         <section className="bg-stone-100/50 py-16 lg:py-32">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-20">
               <div className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-2xl shadow-stone-200/50 border border-stone-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                     <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">Sıkça Sorulan Sorular</h2>
                        <p className="text-stone-500 font-medium leading-relaxed max-w-md text-sm md:text-base">
                           Müşteri hizmetlerimize ulaşmadan önce, sormak üzere olduğunuz sorunun aşağıda olup olmadığına bakabilirsiniz. Böylece müşteri hizmetleri ekibi gerçekten yardıma ihtiyacı olan müşterilerimizle ilgilenebilir.
                        </p>
                        <div className="pt-8 text-sm font-medium text-stone-500 space-y-1">
                           <p>Müşteri hizmetlerinin çalışma saatleri: Pazartesi - Cuma: 10:30-17:00</p>
                           <p>Ortalama cevap süresi: 15 dakika</p>
                        </div>
                     </div>

                     <div className="bg-stone-50 rounded-[2rem] p-6 lg:p-10 space-y-2 border border-stone-100">
                        {[
                           {
                              q: "Siparişim bana ulaşması ne kadar sürer?",
                              a: "Hafta içi Pazartesi - Cuma saat 14:00'den önce verilen siparişler aynı gün kargoya verilir. Kargonun size ulaşma süresi, varış iline göre değişir. Paketiniz, İstanbul gibi büyük şehirlere genellikle ertesi gün ulaşır. Diğer illere ise ulaşım süresi maksimum 2 iş günüdür."
                           },
                           {
                              q: "Siparişim kargoya verilmemiş gözüküyor, bunun nedeni nedir?",
                              a: "Her ne kadar biz kendi kargo politikamız dahilinde siparişleri kargoya teslim etsek de kargo şirketi gönderileri zamanlı bir şekilde sisteme girmeyebiliyor. Bu durumda siparişiniz kargoya verilmiş olmasına rağmen elimizde girilecek bir takip kodu olmadığı için sipariş kargoya verilmemiş gözüküyor. En geç ertesi sabah takip kodunuz sisteme girilecektir."
                           },
                           {
                              q: "Kargo şubesi ile bir sorun yaşıyorum, çözebilir misiniz?",
                              a: (
                                 <div className="space-y-4">
                                    <p>Kaybolan, geç teslim edilen veya henüz teslim edilmeyen paketler tamamen çalıştığımız kargo firmasının sorumluluğu altındadır. Bu yüzden buna benzer bir sorunda ilk olarak kargo şubenizle görüşmeniz gerekir.</p>
                                    <p>Eğer size yardımcı olamazlarsa, biz devreye girerek sorunu çözüyoruz. Yani sorumluluğun kargo firmasına ait olmasına rağmen biz mağduriyetinizi gideriyoruz. Ancak bunu yapabilmemiz için ilk olarak sizin şubeyle görüşmüş ve yardım alamamış olmanız gerekiyor.</p>
                                 </div>
                              )
                           },
                           {
                              q: "Elime kusurlu bir ürün geçti, ne yapmalıyım?",
                              a: "Eğer satın aldığınız ürünün kusurlu olduğuna inanıyorsanız, ürünün fotoğraflarını ve kısa tanımını destek@sunixstore.com adresine e-posta olarak gönderirseniz size kısa zamanda yardımcı olunacaktır."
                           }
                        ].map((item, i) => (
                           <details key={i} className="group border-b border-stone-200/60 last:border-0">
                              <summary className="flex cursor-pointer items-center justify-between py-5 font-bold text-stone-900 marker:content-none hover:text-stone-600 transition-colors">
                                 <span className="text-sm md:text-base pr-4">{item.q}</span>
                                 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200/50 text-stone-500 transition-transform duration-300 group-open:rotate-180 flex-shrink-0">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                 </span>
                              </summary>
                              <div className="pb-5 pt-1 text-sm font-medium leading-relaxed text-stone-500">
                                 {item.a}
                              </div>
                           </details>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
