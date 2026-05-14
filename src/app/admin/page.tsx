"use client";

import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "@/lib/api";
import Link from "next/link";

type DashboardData = {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    totalUsers: number;
    totalRevenue: number;
    todayRevenue: number;
  };
  lowStockVariants: {
    id: string;
    sku: string;
    color: string;
    storage?: string | null;
    stock: number;
    product: {
      id: string;
      name: string;
      brand: string;
    };
  }[];
  latestOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
  }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const dashboard = await fetchAdminDashboard();
        setData(dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20">
         <div className="space-y-12">
            <div className="h-12 w-64 bg-stone-100 rounded-full animate-pulse" />
            <div className="grid gap-6 md:grid-cols-3">
               {[1,2,3].map(i => <div key={i} className="h-40 rounded-[2.5rem] bg-stone-50 animate-pulse" />)}
            </div>
         </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-3xl font-black text-stone-900">Dashboard verisi alınamadı.</h1>
        <button onClick={() => window.location.reload()} className="mt-8 rounded-full bg-black px-10 py-4 text-sm font-black text-white uppercase tracking-widest">Tekrar Dene</button>
      </main>
    );
  }

  const stats = [
    { label: "Toplam Gelir", value: `${data.stats.totalRevenue.toLocaleString("tr-TR")} ₺`, color: "bg-black text-white" },
    { label: "Bugünkü Gelir", value: `${data.stats.todayRevenue.toLocaleString("tr-TR")} ₺`, color: "bg-stone-50 text-stone-900" },
    { label: "Toplam Sipariş", value: data.stats.totalOrders, color: "bg-stone-50 text-stone-900" },
    { label: "Bekleyen Sipariş", value: data.stats.pendingOrders, color: "bg-orange-50 text-orange-700" },
    { label: "Ödenmiş Sipariş", value: data.stats.paidOrders, color: "bg-green-50 text-green-700" },
    { label: "Toplam Kullanıcı", value: data.stats.totalUsers, color: "bg-stone-50 text-stone-900" },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Yönetim Paneli</p>
           <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Dashboard</h1>
           <p className="mt-4 text-stone-500 max-w-lg font-medium leading-relaxed">Mağaza performansını ve kritik stok durumlarını buradan takip edin.</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <Link 
             href="/admin/products" 
             className="rounded-full border-2 border-black bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
             style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
           >
             Ürün Yönetimi
           </Link>
           <Link 
             href="/admin/questions" 
             className="rounded-full border-2 border-black bg-stone-50 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
             style={{ color: '#000000', backgroundColor: '#F5F5F4' }}
           >
             Soru Yönetimi
           </Link>
           <Link 
             href="/admin/orders" 
             className="rounded-full bg-black px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition active:scale-95 shadow-xl shadow-stone-200 hover:bg-stone-800"
             style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
           >
             Siparişler
           </Link>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-16">
        {stats.map((item) => (
          <div
            key={item.label}
            className={`rounded-[2.5rem] p-8 transition-all hover:scale-105 ${item.color} shadow-sm`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-4`}>
              {item.label}
            </p>
            <p className="text-3xl font-black tracking-tighter">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-12 lg:grid-cols-[1fr_450px]">
        {/* Son Siparişler */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Son Siparişler</h2>
              <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-stone-900 border-b-2 border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition">TÜMÜNÜ GÖR</Link>
           </div>
           
           <div className="overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-stone-100 bg-stone-50/50">
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Sipariş No</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Müşteri</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Tutar</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                       {data.latestOrders.map((order) => (
                          <tr key={order.id} className="group hover:bg-stone-50/50 transition">
                             <td className="px-8 py-6 text-sm font-black text-stone-900">{order.orderNumber}</td>
                             <td className="px-8 py-6 text-sm font-medium text-stone-500">{order.customerName}</td>
                             <td className="px-8 py-6 text-sm font-black text-stone-900">{order.totalAmount.toLocaleString()} ₺</td>
                             <td className="px-8 py-6">
                                <span className={`inline-block rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-widest border ${
                                   order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                   order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                   'bg-stone-100 text-stone-800 border-stone-200'
                                }`}>
                                   {order.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Düşük Stok */}
        <div className="space-y-8">
           <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Kritik Stok Uyarıları</h2>
           
           <div className="space-y-4">
              {data.lowStockVariants.length === 0 ? (
                 <div className="rounded-[2.5rem] border-2 border-dashed border-stone-100 p-10 text-center">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kritik seviyede ürün yok.</p>
                 </div>
              ) : (
                 data.lowStockVariants.map((variant) => (
                    <div
                      key={variant.id}
                      className="group flex items-center justify-between rounded-[2.5rem] border border-stone-100 bg-white p-6 shadow-sm hover:border-red-100 hover:bg-red-50/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center text-xs font-black text-stone-300 group-hover:bg-red-100 group-hover:text-red-400 transition">
                            {variant.stock}
                         </div>
                         <div>
                            <p className="text-sm font-black text-stone-900 uppercase leading-none">{variant.product.name}</p>
                            <p className="mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                               {variant.color} {variant.storage ? `• ${variant.storage}` : ""}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Kritik Stok</p>
                         <p className="text-lg font-black text-red-600">{variant.stock}</p>
                      </div>
                    </div>
                 ))
              )}
           </div>
           
           <div className="rounded-[2.5rem] bg-stone-900 p-8 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">HIZLI İŞLEM</p>
              <p className="text-sm font-medium leading-relaxed opacity-90 mb-6">Stok durumlarını güncellemek veya yeni varyant eklemek için ürün yönetimine gidin.</p>
              <Link 
                href="/admin/products" 
                className="inline-block rounded-full bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black transition active:scale-95 shadow-lg"
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
              >
                Tüm Ürünleri Yönet
              </Link>
           </div>
        </div>
      </section>
    </main>
  );
}