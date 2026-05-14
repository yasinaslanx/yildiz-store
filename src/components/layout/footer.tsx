"use client";

import Link from "next/link";
import { NewsletterForm } from "@/components/ui/newsletter-form";

const FOOTER_LINKS = {
  shop: [
    { label: "Telefonlar", href: "/phones" },
    { label: "Aksesuarlar", href: "/phone-accessories" },
    { label: "Ses & Müzik", href: "/products?category=ses-muzik" },
    { label: "İndirimli Ürünler", href: "/products?sort=price-asc" },
  ],
  support: [
    { label: "Sipariş Takibi", href: "/orders" },
    { label: "İade ve Değişim", href: "/contact" },
    { label: "Kargo Takip", href: "/contact" },
    { label: "Sıkça Sorulan Sorular", href: "/contact" },
  ],
  corporate: [
    { label: "Hakkımızda", href: "/contact" },
    { label: "İletişim", href: "/contact" },
    { label: "Mağazalarımız", href: "/contact" },
    { label: "Kariyer", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      {/* Top Section: Trust Badges */}
      <div className="border-b-2 border-stone-100">
        <div className="mx-auto max-w-[1440px] divide-x-2 divide-stone-100 grid grid-cols-2 md:grid-cols-4">
           {[
             {
               title: "Hızlı Teslimat",
               desc: "24 Saatte Kargoda",
               icon: (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                   <rect x="9" y="11" width="14" height="10" rx="2"/>
                   <circle cx="12" cy="21" r="1"/>
                   <circle cx="20" cy="21" r="1"/>
                 </svg>
               )
             },
             {
               title: "Güvenli Ödeme",
               desc: "256-bit SSL Koruma",
               icon: (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                   <polyline points="9 12 11 14 15 10"/>
                 </svg>
               )
             },
             {
               title: "Orijinal Ürün",
               desc: "%100 Marka Garantisi",
               icon: (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                 </svg>
               )
             },
             {
               title: "Kolay İade",
               desc: "14 Gün İçinde İade",
               icon: (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="1 4 1 10 7 10"/>
                   <path d="M3.51 15a9 9 0 1 0 .49-3.49"/>
                 </svg>
               )
             }
           ].map((badge, i) => (
             <div key={i} className="flex items-center gap-4 px-8 py-8">
                <div className="flex-shrink-0 h-12 w-12 rounded-2xl border-2 border-stone-100 bg-stone-50 flex items-center justify-center text-stone-700">
                   {badge.icon}
                </div>
                <div>
                   <p className="text-xs font-black uppercase tracking-tight text-stone-900">{badge.title}</p>
                   <p className="mt-0.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">{badge.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-stone-900">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white">
                 <span className="text-xl">★</span>
               </div>
               <span>YıldızStore</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-stone-500 max-w-sm">
              Teknolojinin en parlak yıldızlarını, en güvenilir ve premium deneyimle kapınıza getiriyoruz.
            </p>
            
            <div className="space-y-4 pt-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Bültene Abone Ol</p>
               <NewsletterForm />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8">
             <div className="grid grid-cols-2 gap-10 md:grid-cols-4 divide-x-0 md:divide-x divide-stone-100">
                <div className="space-y-6 md:pl-0">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Alışveriş</h4>
                   <ul className="space-y-4">
                      {FOOTER_LINKS.shop.map(link => (
                        <li key={link.label}>
                           <Link href={link.href} className="group flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900 transition-all">
                              <span className="h-1 w-0 rounded-full bg-stone-900 transition-all group-hover:w-2" />
                              {link.label}
                           </Link>
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="space-y-6 md:pl-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Destek</h4>
                   <ul className="space-y-4">
                      {FOOTER_LINKS.support.map(link => (
                        <li key={link.label}>
                           <Link href={link.href} className="group flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900 transition-all">
                              <span className="h-1 w-0 rounded-full bg-stone-900 transition-all group-hover:w-2" />
                              {link.label}
                           </Link>
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="space-y-6 md:pl-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Kurumsal</h4>
                   <ul className="space-y-4">
                      {FOOTER_LINKS.corporate.map(link => (
                        <li key={link.label}>
                           <Link href={link.href} className="group flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900 transition-all">
                              <span className="h-1 w-0 rounded-full bg-stone-900 transition-all group-hover:w-2" />
                              {link.label}
                           </Link>
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="space-y-6 md:pl-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">İletişim</h4>
                   <ul className="space-y-4">
                      <li className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-stone-300">E-posta</p>
                        <p className="text-sm font-bold text-stone-900">destek@yildizstore.com</p>
                      </li>
                      <li className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-stone-300">Telefon</p>
                        <p className="text-sm font-bold text-stone-900">0850 123 45 67</p>
                      </li>
                      <li className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-stone-300">Çalışma Saatleri</p>
                        <p className="text-sm font-bold text-stone-600">Hafta içi: 09:00 - 18:00</p>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-stone-100 pt-10 md:flex-row">
           <div className="text-xs font-bold text-stone-400">
             © 2026 Yıldız Store. Premium Teknoloji Mağazası.
           </div>

           {/* Payment Logos (Simulated with text/style) */}
           <div className="flex items-center gap-4">
              <div className="flex h-8 items-center rounded-lg border border-stone-100 bg-white px-3 text-[10px] font-black tracking-widest text-stone-400 opacity-60">VISA</div>
              <div className="flex h-8 items-center rounded-lg border border-stone-100 bg-white px-3 text-[10px] font-black tracking-widest text-stone-400 opacity-60">MASTERCARD</div>
              <div className="flex h-8 items-center rounded-lg border border-stone-100 bg-white px-3 text-[10px] font-black tracking-widest text-stone-400 opacity-60">TROY</div>
              <div className="flex h-8 items-center rounded-lg border border-stone-100 bg-white px-3 text-[10px] font-black tracking-widest text-stone-400 opacity-60">IYZICO</div>
           </div>

           {/* Socials */}
           <div className="flex gap-4">
              <a 
                href="https://instagram.com/yildiz.store63" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a 
                href="https://x.com/Yasinx77z" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
           </div>
        </div>
      </div>
    </footer>
  );
}
