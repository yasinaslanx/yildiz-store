"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOrders } from "@/lib/api";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    image?: string | null;
    quantity: number;
    price: number;
  }[];
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim edildi",
    CANCELLED: "İptal edildi",
  };
  return labels[status] ?? status;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Dashboard Sidebar */}
        <aside className="w-full shrink-0 lg:w-80">
           <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Hesabım</p>
              <h2 className="mt-2 text-2xl font-black text-stone-900 tracking-tighter uppercase">Panelim</h2>
              
              <nav className="mt-10 space-y-2">
                 <Link href="/orders" className="flex items-center gap-4 rounded-2xl border-2 border-black bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-stone-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    Siparişlerim
                 </Link>
                 <Link href="/favorites" className="flex items-center gap-4 rounded-2xl border border-transparent px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 transition hover:bg-stone-50 hover:text-stone-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    Favorilerim
                 </Link>
                 <Link href="/profile" className="flex items-center gap-4 rounded-2xl border border-transparent px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 transition hover:bg-stone-50 hover:text-stone-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profil Bilgilerim
                 </Link>
              </nav>

              <div className="mt-12 rounded-3xl bg-stone-50 p-6 border border-stone-100">
                 <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Yardım</p>
                 <p className="mt-2 text-[10px] font-bold text-stone-500 leading-relaxed uppercase">Siparişinizle ilgili bir sorun mu var? Hemen canlı desteğe bağlanın.</p>
                 <button className="mt-4 text-[10px] font-black text-stone-900 uppercase tracking-widest underline underline-offset-4">Destek Al</button>
              </div>
           </div>
        </aside>

        {/* Orders Content */}
        <div className="flex-1 space-y-12">
           <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Geçmiş</p>
                 <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Tüm Siparişlerim</h1>
              </div>
              <p className="text-sm font-black text-stone-400 uppercase tracking-widest"><span className="text-stone-900">{orders.length}</span> Sipariş Bulundu</p>
           </div>

           {loading ? (
             <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
             </div>
           ) : orders.length === 0 ? (
             <div className="rounded-[4rem] border border-dashed border-stone-200 p-24 text-center">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-stone-50 flex items-center justify-center text-stone-300 text-4xl mb-8">📦</div>
                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Henüz Siparişiniz Yok</h2>
                <p className="mt-4 text-stone-400 font-medium max-w-xs mx-auto">YıldızStore'un benzersiz koleksiyonlarını keşfetmeye hemen başlayın.</p>
                <Link href="/products" className="mt-10 inline-block rounded-full border-2 border-black bg-white px-10 py-5 text-[11px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50 active:scale-95 shadow-xl shadow-stone-100">Alışverişe Başla</Link>
             </div>
           ) : (
             <div className="grid gap-8">
                {orders.map((order) => (
                  <div key={order.id} className="group overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-stone-100 transition-all duration-700">
                     <div className="bg-stone-50/50 p-10 flex flex-wrap items-center justify-between gap-8 border-b border-stone-50">
                        <div className="flex items-center gap-10">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sipariş Tarihi</p>
                              <p className="text-xs font-black text-stone-900 mt-1 uppercase">{new Date(order.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                           </div>
                           <div className="h-10 w-px bg-stone-200 hidden sm:block" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Toplam Tutar</p>
                              <p className="text-sm font-black text-stone-900 mt-1 uppercase">{order.totalAmount.toLocaleString()} ₺</p>
                           </div>
                           <div className="h-10 w-px bg-stone-200 hidden sm:block" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sipariş No</p>
                              <p className="text-xs font-black text-stone-500 mt-1 uppercase tracking-tighter">#{order.orderNumber}</p>
                           </div>
                        </div>
                        <Link href={`/orders/${order.id}`} className="rounded-full border-2 border-black bg-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-stone-50 transition active:scale-95 shadow-md">Detayları Gör</Link>
                     </div>

                     <div className="p-10 flex flex-wrap items-center justify-between gap-10">
                        <div className="flex items-center gap-6 overflow-hidden">
                           <div className="flex -space-x-4">
                              {order.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.5rem] border-2 border-white bg-white p-3 shadow-xl shadow-stone-100">
                                   <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-2 border-white bg-stone-100 text-xs font-black text-stone-400 shadow-xl shadow-stone-100">
                                   +{order.items.length - 3}
                                </div>
                              )}
                           </div>
                           <div className="hidden md:block">
                              <p className="text-sm font-black text-stone-900 group-hover:underline underline-offset-8 decoration-2 decoration-stone-200 transition-all">{order.items[0].productName}</p>
                              <p className="mt-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{order.items.length} Ürünlük Sipariş</p>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                           <div className={`rounded-full border-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              order.status === 'DELIVERED' ? 'border-green-500 bg-green-50 text-green-700' : 
                              order.status === 'CANCELLED' ? 'border-red-500 bg-red-50 text-red-700' :
                              'border-stone-900 bg-white text-stone-900'
                           }`}>
                              {statusLabel(order.status)}
                           </div>
                           {order.status === 'SHIPPED' && <p className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-pulse">Kargo Teslimat Aşamasında</p>}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
