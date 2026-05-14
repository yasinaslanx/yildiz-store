"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { useFavorites } from "@/store/favorites-store";
import { fetchOrders } from "@/lib/api";
import { Trash2, ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { items: favoriteItems, toggleFavorite } = useFavorites();
  const tabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromQuery || "info");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  useEffect(() => {
    if (user && activeTab === "orders" && orders.length === 0) {
      setOrdersLoading(true);
      fetchOrders()
        .then((data) => setOrders(data))
        .catch((err) => console.error(err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user, activeTab, orders.length]);

  // Giriş yapmamış kullanıcıyı yönlendir
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const confirmLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);

  const tabs = [
    { id: "info", label: "Hesap Bilgilerim", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )},
    { id: "orders", label: "Siparişlerim", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    )},
    { id: "addresses", label: "Adreslerim", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    )},
    { id: "favorites", label: "Favorilerim", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    )}
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-20 lg:py-20">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Yönetim</p>
          <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Hesabım</h1>
        </div>
        <button
          onClick={confirmLogout}
          className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition"
        >
          Çıkış Yap
        </button>

        {/* Çıkış Onay Modalı */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Arka plan overlay */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={cancelLogout}
            />
            {/* Modal Kutusu */}
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
                    onClick={handleLogout}
                    className="w-full rounded-full bg-stone-900 py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-black active:scale-95"
                    style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
                  >
                    Evet, Çıkış Yap
                  </button>
                  <button
                    onClick={cancelLogout}
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
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-black text-white shadow-xl shadow-stone-200"
                  : "bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <div className={activeTab === tab.id ? "text-white" : "text-stone-400"}>
                {tab.icon}
              </div>
              <span className={`text-sm font-black uppercase tracking-wider ${activeTab === tab.id ? "text-white" : ""}`} style={{ color: activeTab === tab.id ? '#FFFFFF' : undefined }}>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 rounded-[2.5rem] border-2 border-stone-100 bg-white p-8 lg:p-12 shadow-sm min-h-[400px]">
          {activeTab === "info" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">Kişisel Bilgiler</h2>
              <p className="mt-2 text-sm font-bold text-stone-400">Hesap bilgilerinizi buradan görüntüleyebilirsiniz.</p>
              
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border border-stone-100 bg-stone-50/30 p-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Üyelik Bilgileri</p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Tam Ad</p>
                      <p className="mt-1 text-lg font-black text-stone-900 italic tracking-tighter uppercase">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">E-Posta</p>
                      <p className="mt-1 text-lg font-black text-stone-900 italic tracking-tighter">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-100 bg-stone-50/30 p-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Hesap Güvenliği</p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Şifre Durumu</p>
                      <p className="mt-1 text-sm font-bold text-stone-900 uppercase">GÜVENLİ (Şifrelenmiş)</p>
                    </div>
                    <div>
                      <button className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-stone-900 underline underline-offset-8 decoration-stone-200 hover:decoration-stone-900 transition">
                        Şifre Değişikliği Talep Et
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 rounded-3xl bg-black text-white">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-black italic tracking-tighter uppercase">Premium Destek</h3>
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Öncelikli müşteri desteğinden faydalanın.</p>
                    </div>
                    <button className="cursor-pointer rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-stone-100 transition">
                       Bize Ulaşın
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">Sipariş Geçmişim</h2>
              <p className="mt-2 text-sm font-bold text-stone-400 mb-8">Tüm siparişlerinizi ve durumlarını buradan takip edebilirsiniz.</p>
              
              {ordersLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-stone-200 bg-stone-50 text-stone-400">
                    {tabs.find(t => t.id === "orders")?.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Henüz Siparişiniz Yok</h3>
                  <p className="mt-2 text-sm font-bold text-stone-400">Yeni ürünlerimizi keşfederek ilk siparişinizi verebilirsiniz.</p>
                  <Link href="/products" className="inline-block mt-8 rounded-full border-2 border-black bg-white px-8 py-3 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95">
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-stone-100 bg-stone-50 p-6 transition hover:border-stone-200">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Sipariş No</p>
                        <p className="mt-1 text-sm font-black text-stone-900">{order.orderNumber}</p>
                        <p className="mt-1 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Tutar</p>
                          <p className="mt-1 text-sm font-black text-stone-900">{order.totalAmount.toLocaleString("tr-TR")} ₺</p>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Durum</p>
                          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border-2 border-stone-100">
                            <div className="h-1.5 w-1.5 rounded-full bg-stone-900"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">
                              {order.status === "PENDING" ? "Hazırlanıyor" : order.status}
                            </span>
                          </div>
                        </div>
                        
                        <Link 
                          href={`/orders/${order.id}`}
                          className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-stone-800 active:scale-95"
                          style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
                        >
                          DETAYLARI GÖR
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20 flex flex-col items-center justify-center">
               <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-stone-200 bg-stone-50 text-stone-400">
                {tabs.find(t => t.id === "addresses")?.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Kayıtlı Adresiniz Yok</h3>
              <p className="mt-2 text-sm font-bold text-stone-400">Hızlı ödeme için adres ekleyebilirsiniz.</p>
              <button className="mt-8 rounded-full border-2 border-black bg-white px-8 py-3 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95">
                Yeni Adres Ekle
              </button>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">Favorilerim</h2>
                  <p className="mt-2 text-sm font-bold text-stone-400">Beğendiğiniz ürünlere buradan hızlıca ulaşabilirsiniz.</p>
                </div>
                <div className="rounded-full bg-stone-50 px-4 py-2 border border-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{favoriteItems.length} Ürün</p>
                </div>
              </div>

              {favoriteItems.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                   <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-stone-200 bg-stone-50 text-stone-400">
                    {tabs.find(t => t.id === "favorites")?.icon}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Favori Ürününüz Yok</h3>
                  <p className="mt-2 text-sm font-bold text-stone-400">Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</p>
                  <Link href="/products" className="inline-block mt-8 rounded-full border-2 border-black bg-white px-8 py-3 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95">
                    Ürünleri Keşfet
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favoriteItems.map((item) => (
                    <div key={item.id} className="group relative flex items-center gap-6 rounded-3xl border-2 border-stone-100 bg-stone-50 p-4 transition hover:border-stone-200">
                      <Link href={`/products/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white p-3 border border-stone-100">
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          className="h-full w-full object-contain transition duration-500 group-hover:scale-110" 
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{item.brand}</p>
                            <Link href={`/products/${item.slug}`}>
                              <h4 className="text-base font-black text-stone-900 uppercase tracking-tighter truncate italic group-hover:text-stone-600 transition">
                                {item.productName}
                              </h4>
                            </Link>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Fiyat</p>
                             <p className="text-lg font-black text-stone-900 italic tracking-tighter">
                               {item.price.toLocaleString("tr-TR")} ₺
                             </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-3">
                           <Link 
                            href={`/products/${item.slug}`}
                            className="flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50 hover:border-stone-900 transition shadow-sm"
                           >
                             <ShoppingBag className="h-3 w-3" />
                             İncele
                           </Link>
                           <button 
                            onClick={() => toggleFavorite(item)}
                            className="flex items-center gap-2 rounded-full bg-white border border-stone-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                           >
                             <Trash2 className="h-3 w-3" />
                             Kaldır
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
