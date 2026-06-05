"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/store/cart-store";
import { useFavorites } from "@/store/favorites-store";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, ShoppingBag, User, LogOut, ChevronRight, Home, Smartphone, Headphones } from "lucide-react";
import { SunixLogo } from "./sunix-logo";
import { CurrencySelector } from "@/components/ui/currency-selector";

const navItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/products", label: "Tüm Ürünler" },
  { href: "/products?category=telefonlar,phones", label: "Telefonlar" },
  { href: "/products?category=phone-accessories,akilli-saat,bluetooth-kulaklik,kablolu-kulaklik,sarj-aleti,kablo,kapak-kilif,ekran-koruyucu,arac-sarj-fm-modulator,arac-telefon-tutucu,cevirici,depolamasd-urunleri,hoparlor,tasinabilir-pil,lensler,diger-aksesuarlar", label: "Aksesuarlar" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount, clearLocalState: clearCartState } = useCart();
  const { items, clearLocalState: clearFavoritesState } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  const { openCart } = useUi();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentCategory = searchParams.get("category");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Announcement Bar Marquee */}
      <div className="relative z-[60] bg-stone-900 text-white py-2.5 overflow-hidden flex items-center border-b border-stone-800">
         <div className="flex animate-marquee whitespace-nowrap w-max">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 px-6 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex-shrink-0">
                 <span>2199₺ ve üzeri siparişlerinizde <span className="text-stone-400">ücretsiz* kargo</span></span>
                 <span className="h-1 w-1 rounded-full bg-stone-700" />
                 <span>Hafta içi saat 14.00'dan önce verilen siparişler <span className="text-stone-400">aynı gün kargoya teslim edilir.</span></span>
                 <span className="h-1 w-1 rounded-full bg-stone-700" />
              </div>
            ))}
         </div>
      </div>

      {/* Secondary Bar */}
      <div className="relative z-[60] bg-stone-50 border-b border-stone-100 py-3 px-6 hidden sm:block">
         <div className="mx-auto max-w-[1440px] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="inline-flex items-center rounded-full bg-stone-900 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                  YENİ
               </span>
               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  İLK ALIŞVERİŞE ÖZEL %10 İNDİRİM FIRSATI!
               </p>
            </div>
            <div className="flex items-center gap-8">
               <CurrencySelector />
               <Link href="/contact" className="text-[9px] font-black text-stone-400 hover:text-stone-900 transition uppercase tracking-[0.2em]">Destek Merkezi</Link>
               <Link href="/stores" className="text-[9px] font-black text-stone-400 hover:text-stone-900 transition uppercase tracking-[0.2em]">Mağazalarımız</Link>
            </div>
         </div>
      </div>

      <header className="sticky top-0 w-full z-50 border-b border-stone-100 bg-white/70 backdrop-blur-3xl shadow-sm transition-all duration-500">
        <div className="mx-auto flex max-w-[1440px] items-center px-6 py-5 gap-4 lg:gap-12">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex xl:hidden h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-stone-900 transition active:scale-90 cursor-pointer"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <SunixLogo style={{ fontSize: "2rem" }} />

          {/* Navigation - Spaced out */}
          <nav className="hidden xl:flex items-center gap-10">
            <Link href="/" className={`relative text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:text-stone-900 ${pathname === "/" ? "text-stone-900" : "text-stone-400"}`}>
              Ana Sayfa
              {pathname === "/" && <span className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-stone-900 animate-in fade-in zoom-in-50 duration-500" />}
            </Link>

            <div className="group relative">
              <Link href="/products" className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:text-stone-900 ${pathname.startsWith("/products") ? "text-stone-900" : "text-stone-400"}`}>
                Kategoriler
                <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                {pathname.startsWith("/products") && <span className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-stone-900 animate-in fade-in zoom-in-50 duration-500" />}
              </Link>

              {/* Mega Menu Dropdown */}
              <div className="absolute left-0 top-full pt-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="w-[1050px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-stone-100 p-12 grid grid-cols-4 gap-12">
                   {/* Column 1 */}
                   <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Akıllı Telefonlar</h4>
                      <ul className="space-y-5">
                         <li><Link href="/products?category=phones" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Tüm Telefonlar</Link></li>
                         <li><Link href="/products?brand=Apple" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Apple iPhone</Link></li>
                         <li><Link href="/products?brand=Samsung" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Samsung Galaxy</Link></li>
                      </ul>
                   </div>
                   {/* Column 2 */}
                   <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Aksesuarlar</h4>
                      <ul className="space-y-5">
                         <li><Link href="/products?category=phone-accessories" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Kılıflar & Kapaklar</Link></li>
                         <li><Link href="/products?q=ekran" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Ekran Koruyucular</Link></li>
                         <li><Link href="/products?q=şarj" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Şarj Aletleri & Kablolar</Link></li>
                         <li><Link href="/products?q=powerbank" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Powerbank</Link></li>
                      </ul>
                   </div>
                   {/* Column 3 */}
                   <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Ses ve Giyilebilir</h4>
                      <ul className="space-y-5">
                         <li><Link href="/products?q=kulaklık" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Bluetooth Kulaklık</Link></li>
                         <li><Link href="/products?q=saat" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Akıllı Saatler</Link></li>
                         <li><Link href="/products?q=hoparlör" className="text-sm font-bold text-stone-600 hover:text-stone-900 transition">Hoparlör</Link></li>
                      </ul>
                   </div>
                   {/* Column 4 - Highlight */}
                   <div className="bg-stone-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-stone-100 group/banner hover:border-black transition-colors cursor-pointer">
                      <div className="bg-stone-900 text-white text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest mb-5">ÖNE ÇIKAN</div>
                      <h4 className="text-base font-black text-stone-900 uppercase italic tracking-tight mb-3">Sunix Premium Kılıf Serisi</h4>
                      <Link href="/products?category=phone-accessories" className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-900 underline underline-offset-4 group-hover/banner:text-stone-500 transition">Hemen İncele</Link>
                   </div>
                </div>
              </div>
            </div>
            
            <Link href="/contact" className={`relative text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:text-stone-900 ${pathname === "/contact" ? "text-stone-900" : "text-stone-400"}`}>
              İletişim
              {pathname === "/contact" && <span className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-stone-900 animate-in fade-in zoom-in-50 duration-500" />}
            </Link>
            
            {isMounted && user?.role === "admin" && (
              <Link
                href="/admin/support"
                className={`relative text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100 hover:border-black ${
                  pathname.startsWith("/admin/support") ? "text-stone-900 border-black" : "text-stone-400"
                }`}
              >
                Destek Panel
              </Link>
            )}
          </nav>

          {/* Search Bar - Professional Center/Right */}
          <div className="flex-1 max-w-md mx-auto hidden lg:block">
             <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="Ürün veya model ara..." 
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-6 py-3.5 text-[11px] font-bold text-stone-900 outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all pr-12"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition scale-110">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
             </form>
          </div>

          {/* Actions - Clean Icon Group */}
          <div className="flex items-center gap-2 sm:gap-6 ml-auto flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/profile?tab=favorites"
                className="group relative p-3 text-stone-400 transition hover:text-stone-900 hover:bg-stone-50 rounded-2xl cursor-pointer"
                aria-label="Favoriler"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                {items.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-[8px] font-black text-white shadow-sm">
                    {items.length}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="group relative p-3 text-stone-400 transition hover:text-stone-900 hover:bg-stone-50 rounded-2xl cursor-pointer"
                aria-label="Sepet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-[8px] font-black text-white shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-8 w-px bg-stone-100 hidden sm:block" />

            {/* Auth Section */}
            {isMounted ? (isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="hidden flex-col items-end sm:flex group transition">
                  <p className="text-[8px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-900">Hesabım</p>
                  <p className="text-xs font-black text-stone-900 leading-none mt-1">{user?.firstName}</p>
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="cursor-pointer hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-100 transition hover:bg-red-50 hover:border-red-100 hover:text-red-500 shadow-sm"
                  title="Çıkış Yap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-3 group">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-50 text-stone-400 transition-all duration-300 group-hover:bg-stone-900 group-hover:text-white group-active:scale-95">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="hidden text-left xl:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 transition-colors group-hover:text-stone-900">Hesabım</p>
                  <p className="text-xs font-black text-stone-900 leading-none mt-1">Giriş Yap</p>
                </div>
              </Link>
            )) : (
              <div className="hidden sm:flex items-center gap-3 w-[120px]"></div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] xl:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 p-8">
                <SunixLogo style={{ fontSize: "1.75rem" }} onClick={() => setIsMobileMenuOpen(false)} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-10">
                 {/* Mobile Search */}
                 <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="relative block lg:hidden">
                    <input 
                      type="text" 
                      placeholder="Ürün veya model ara..." 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-6 py-4 text-xs font-bold text-stone-900 outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-stone-100 transition-all pr-12"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition scale-110">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </button>
                 </form>

                {/* Auth State */}
                {isMounted ? (isAuthenticated ? (
                  <div className="mb-10 p-6 rounded-[2.5rem] bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-stone-900 font-black">
                        {user?.firstName[0]}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Hoş Geldin,</p>
                        <p className="text-sm font-black text-stone-900 italic tracking-tight">{user?.firstName} {user?.lastName}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2">
                       <Link 
                        href="/profile" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center rounded-2xl bg-white py-3 text-[9px] font-black uppercase tracking-widest text-stone-900 shadow-sm"
                       >
                         Hesabım
                       </Link>
                       <button 
                        onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }}
                        className="flex items-center justify-center rounded-2xl bg-red-50 py-3 text-[9px] font-black uppercase tracking-widest text-red-500 cursor-pointer"
                       >
                         Çıkış
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-10 grid grid-cols-2 gap-3">
                    <Link 
                      href="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-2xl bg-stone-900 py-5 text-[10px] font-black uppercase tracking-widest text-white"
                      style={{ color: "#ffffff" }}
                    >
                      Giriş Yap
                    </Link>
                    <Link 
                      href="/register" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-2xl border-2 border-stone-100 bg-white py-5 text-[10px] font-black uppercase tracking-widest text-stone-900"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )) : null}

                {/* Main Navigation */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 pl-4">Menü</p>
                  <div className="grid gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-2xl bg-stone-50/50 p-5 text-sm font-black uppercase tracking-tight text-stone-900 hover:bg-stone-50"
                      >
                        <span className="italic tracking-tighter">{item.label}</span>
                        <ChevronRight size={16} className="text-stone-300" />
                      </Link>
                    ))}
                    
                    <Link
                      href="/stores"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-stone-50/50 p-5 text-sm font-black uppercase tracking-tight text-stone-900 hover:bg-stone-50"
                    >
                      <span className="italic tracking-tighter">Mağazalarımız</span>
                      <ChevronRight size={16} className="text-stone-300" />
                    </Link>

                    <Link
                      href="/dealer-application"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-stone-50/50 p-5 text-sm font-black uppercase tracking-tight text-stone-900 hover:bg-stone-50"
                    >
                      <span className="italic tracking-tighter">Bayilik Başvurusu</span>
                      <ChevronRight size={16} className="text-stone-300" />
                    </Link>
                    {isMounted && user?.role === "admin" && (
                       <Link
                        href="/admin/support"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-2xl bg-stone-900 p-5 text-sm font-black uppercase tracking-tight text-white"
                      >
                        <span className="italic tracking-tighter text-white">Admin Panel</span>
                        <ChevronRight size={16} className="text-stone-300" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mobile Currency & Quick Actions */}
                <div className="mt-8 flex items-center justify-between p-6 rounded-[2.5rem] bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Para Birimi</span>
                  <CurrencySelector />
                </div>

                {/* Quick Info */}
                <div className="mt-12 p-8 rounded-[2.5rem] bg-stone-50 border border-stone-100">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Premium Teknoloji</p>
                   <p className="mt-2 text-xs font-medium text-stone-400 leading-relaxed">
                     En yeni ürünler ve özel fırsatlar için bizi takipte kalın.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Çıkış Onay Modalı - Moved outside header to avoid backdrop-blur containment */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-[3rem] bg-white p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-8 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tighter text-stone-900 uppercase italic">Çıkış Yap</h2>
                <p className="text-sm font-medium text-stone-400 leading-relaxed">
                  Hesabınızdan çıkış yapmak istediğinize emin misiniz?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    await logout();
                    clearCartState();
                    clearFavoritesState();
                    setShowLogoutModal(false);
                  }}
                  className="w-full rounded-full bg-stone-900 py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-black active:scale-95"
                  style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
                >
                  Evet, Çıkış Yap
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full rounded-full border-2 border-stone-100 py-5 text-xs font-black uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-50 active:scale-95"
                  style={{ color: '#000000' }}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
