"use client";

import Link from "next/link";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { SunixLogo } from "./sunix-logo";

const FOOTER_LINKS = {
   shop: [
      { label: "Telefonlar", href: "/phones" },
      { label: "Aksesuarlar", href: "/products?category=kapak-kilif,sarj-aleti,ekran-koruyucu" },
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
      { label: "Bayilik Başvurusu", href: "/dealer-application" },
   ],
};

export function Footer() {
   return (
      <footer className="border-t border-stone-100 bg-white print:hidden">
         <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
            <div className="grid gap-16 lg:grid-cols-12">
               {/* Brand and Newsletter */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="flex items-center">
                     <SunixLogo style={{ fontSize: "2.25rem" }} />
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-stone-500 max-w-sm">
                     Sunix'in kaliteli ürünlerini en güvenilir ve premium deneyimle kapınıza getiriyoruz.
                  </p>

                  <div className="space-y-4 pt-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Bültene Abone Ol</p>
                     <NewsletterForm />
                  </div>
               </div>

               {/* Links Grid */}
               <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                     {/* Column 1: Menu */}
                     <div className="space-y-6">
                        <h4 className="font-bold text-stone-900">Menu</h4>
                        <ul className="space-y-4 text-sm font-medium text-stone-500">
                           <li><Link href="/products" className="hover:text-stone-900 transition-colors">Ara</Link></li>
                           <li><Link href="/order-tracking" className="hover:text-stone-900 transition-colors">Sipariş Takibi</Link></li>
                           <li><Link href="/contact" className="hover:text-stone-900 transition-colors">İletişim</Link></li>
                           <li><Link href="/products?category=outlet" className="hover:text-stone-900 transition-colors">Outlet</Link></li>
                           <li><Link href="#" className="hover:text-stone-900 transition-colors">Gizlilik Politikası</Link></li>
                           <li><Link href="#" className="hover:text-stone-900 transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
                           <li><Link href="#" className="hover:text-stone-900 transition-colors">İade Koşulları</Link></li>
                           <li><Link href="#" className="hover:text-stone-900 transition-colors">Kargo ve Teslimat Bilgileri</Link></li>
                           <li><Link href="/product-requests" className="hover:text-stone-900 transition-colors">Ürün talep et</Link></li>
                           <li><span className="hover:text-stone-900 transition-colors cursor-pointer"></span></li>
                        </ul>
                     </div>

                     {/* Column 2: Destek Hattı */}
                     <div className="space-y-6">
                        <h4 className="font-bold text-stone-900">Destek Hattı</h4>
                        <div className="space-y-6 text-sm font-medium text-stone-500">
                           <div>
                              <p className="font-bold text-stone-900">E-mail Adresimiz:</p>
                              <p className="mt-1 hover:text-stone-900 transition-colors cursor-pointer">destek@sunixstore.net.tr</p>
                           </div>
                           <div>
                              <p className="font-bold text-stone-900">Telefon:</p>
                              <p className="mt-1">+90 540 082 82 63</p>
                           </div>
                           <div>
                              <p className="font-bold text-stone-900">İş Birliği Talepleriniz İçin:</p>
                              <p className="mt-1 hover:text-stone-900 transition-colors cursor-pointer">isbirligi@sunixstore.net.tr</p>
                           </div>
                           <div>
                              <p className="font-bold text-stone-900">Toplu Satın Alım Talepleriniz İçin (For distribution cooperation inquiries):</p>
                              <p className="mt-1 hover:text-stone-900 transition-colors cursor-pointer">sales@sunixstore.net.tr</p>
                           </div>
                           <div>
                              <p className="font-bold text-stone-900">Canlı Destek</p>
                              <p className="mt-1 leading-relaxed">Hafta içi <span className="font-bold text-stone-900">10:30 - 17:00</span> saatleri arasında sitenin sağ alt köşesinde canlı destek baloncuğuna ulaşabilirsiniz.</p>
                           </div>

                        </div>
                     </div>

                     {/* Column 3: Adreslerimiz */}
                     <div className="space-y-6">
                        <h4 className="font-bold text-stone-900">Adreslerimiz</h4>
                        <div className="space-y-8 text-sm font-medium text-stone-500">
                           <div>
                              <p className="font-bold text-stone-900 mb-2">Merkez Ofis</p>
                              <p className="leading-relaxed">Şanlıurfa Siverek</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-stone-100 pt-10 md:flex-row">
               <div className="text-xs font-bold text-stone-400">
                  © 2026 Sunix Store. Premium Teknoloji Mağazası.
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
                     href="https://instagram.com/sunixstore"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-stone-400 hover:text-stone-900 transition-colors"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                  </a>
                  <a
                     href="https://x.com/Yasinx77z"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-stone-400 hover:text-stone-900 transition-colors"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                  </a>
               </div>
            </div>
         </div>
      </footer>
   );
}
