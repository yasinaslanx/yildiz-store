"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchOrderDetail } from "@/lib/api";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    brand: string;
    color: string;
    storage?: string | null;
    image?: string | null;
    price: number;
    quantity: number;
    total: number;
  }[];
};

const STATUS_STEPS = [
  { id: "PENDING", label: "Sipariş Alındı", icon: "📝", desc: "Talebiniz bize ulaştı." },
  { id: "CONFIRMED", label: "Onaylandı", icon: "✔️", desc: "Ödeme kontrol edildi." },
  { id: "SHIPPED", label: "Kargoda", icon: "🚚", desc: "Paketiniz yola çıktı." },
  { id: "DELIVERED", label: "Teslim Edildi", icon: "🏠", desc: "Keyifli kullanımlar!" },
];

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

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CASH_ON_DELIVERY: "Kapıda Ödeme",
    BANK_TRANSFER: "Banka Havalesi",
    CREDIT_CARD: "Kredi Kartı",
  };
  return labels[method] ?? method;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!params.orderId) return;
        const data = await fetchOrderDetail(params.orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params.orderId]);

  const currentStatusIndex = order ? STATUS_STEPS.findIndex(s => s.id === order.status) : -1;

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-stone-100 border-t-black" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
         <h1 className="text-2xl font-black text-stone-900 tracking-tighter">Sipariş Bulunamadı</h1>
         <Link href="/orders" className="mt-6 inline-block text-stone-400 underline uppercase tracking-widest text-[10px] font-black">Listeye Dön</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-80">
           <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm">
              <Link href="/orders" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition mb-10 group">
                 <svg className="transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                 Tüm Siparişlerim
              </Link>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sipariş No</p>
                    <p className="text-lg font-black text-stone-900 tracking-tighter mt-1">#{order.orderNumber}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</p>
                    <div className="mt-2 inline-block rounded-full bg-stone-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">{statusLabel(order.status)}</div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ödeme</p>
                    <p className="text-xs font-bold text-stone-600 mt-1 uppercase tracking-widest">{paymentMethodLabel(order.paymentMethod)}</p>
                 </div>
              </div>

              <div className="mt-12 pt-10 border-t border-stone-50 space-y-8">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-4">Teslimat Adresi</h3>
                    <p className="text-xs font-bold text-stone-900">{order.customerName}</p>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-stone-500 uppercase">
                       {order.shippingAddress}<br />
                       {order.shippingDistrict} / {order.shippingCity}
                    </p>
                 </div>
                 <button className="w-full rounded-2xl bg-stone-50 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition">
                    Adresi Kopyala
                 </button>
              </div>
           </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-12">
           {/* Live Tracking Timeline */}
           <section className="relative overflow-hidden rounded-[3rem] border border-stone-100 bg-white p-12 shadow-2xl shadow-stone-100">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-16">Sipariş Yolculuğu</h2>
              
              <div className="grid gap-12 lg:grid-cols-4">
                 {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div key={step.id} className="relative flex flex-col items-center text-center">
                         {idx < STATUS_STEPS.length - 1 && (
                           <div className="absolute left-[calc(50%+2.5rem)] top-10 hidden h-0.5 w-[calc(100%-5rem)] bg-stone-50 lg:block">
                              <div 
                                className="h-full bg-black transition-all duration-1000" 
                                style={{ width: idx < currentStatusIndex ? '100%' : '0%' }}
                              />
                           </div>
                         )}
                         
                         <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border-2 transition-all duration-700 ${
                           isActive ? 'border-black bg-white text-stone-900 shadow-2xl shadow-stone-200' : 'border-stone-50 bg-stone-50/50 text-stone-200'
                         } ${isCurrent ? 'scale-110' : ''}`}>
                            <span className="text-3xl">{step.icon}</span>
                         </div>
                         <div className="mt-8 space-y-2">
                            <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>{step.label}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase leading-relaxed max-w-[140px]">{step.desc}</p>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </section>

           {/* Order Items & Summary */}
           <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
              <section className="rounded-[3rem] border border-stone-100 bg-white p-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-10">Sipariş İçeriği</h3>
                 <div className="space-y-8">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-8 group">
                         <div className="h-24 w-24 flex-shrink-0 rounded-[2rem] border border-stone-50 bg-white p-4 shadow-sm group-hover:scale-105 transition duration-500">
                            <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                         </div>
                         <div className="flex-1">
                            <p className="text-base font-black text-stone-900 uppercase tracking-tighter">{item.productName}</p>
                            <p className="mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{item.brand} • {item.color} {item.storage ? `• ${item.storage}` : ''}</p>
                            <p className="mt-3 inline-block rounded-lg bg-stone-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-stone-500">{item.quantity} Adet</p>
                         </div>
                         <div className="text-right">
                            <p className="text-base font-black text-stone-900 tracking-tighter">{item.total.toLocaleString()} ₺</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Birim: {item.price.toLocaleString()} ₺</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Order Summary Card */}
              <section className="rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl shadow-stone-300">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-10">Finansal Özet</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ara Toplam</span>
                       <span className="text-sm font-black uppercase">{order.totalAmount.toLocaleString()} ₺</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kargo</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Ücretsiz</span>
                    </div>
                    <div className="pt-8 border-t border-stone-800 flex flex-col gap-2">
                       <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ödenecek Tutar</span>
                       <span className="text-4xl font-black tracking-tighter">{order.totalAmount.toLocaleString()} ₺</span>
                    </div>
                 </div>
                 <button className="mt-12 w-full rounded-2xl bg-white py-5 text-[11px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition active:scale-95 shadow-xl shadow-stone-800/20">
                    Faturayı İndir (PDF)
                 </button>
              </section>
           </div>

           {/* Support Callout */}
           <div className="rounded-[3rem] border border-stone-100 bg-stone-50/50 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">💬</div>
                 <div>
                    <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest">Yardıma mı ihtiyacınız var?</h4>
                    <p className="mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">Müşteri temsilcilerimiz siparişinizle ilgili her konuda yanınızda.</p>
                 </div>
              </div>
              <button className="whitespace-nowrap rounded-full border-2 border-black bg-white px-10 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50">Canlı Desteğe Bağlan</button>
           </div>
        </div>
      </div>
    </main>
  );
}
