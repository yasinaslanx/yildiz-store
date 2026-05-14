"use client";

import { useEffect, useState } from "react";

export default function AdminStockAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stock-alerts");
        const data = await res.json();
        if (data.success) setAlerts(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Talep Takibi</p>
        <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Stok Bekleyenler</h1>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-stone-50/50 border-b border-stone-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün / Varyant</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Müşteri E-posta</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Tarih</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                 {alerts.map((alert) => (
                   <tr key={alert.id} className="group hover:bg-stone-50/30 transition-colors">
                      <td className="px-8 py-6">
                         <p className="text-sm font-black text-stone-900 uppercase tracking-tighter">{alert.variant.product.name}</p>
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{alert.variant.color} {alert.variant.storage ? `/ ${alert.variant.storage}` : ''}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-xs font-bold text-stone-900">{alert.email}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-[10px] font-black text-stone-400 uppercase">{new Date(alert.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                           alert.notified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                         }`}>
                            {alert.notified ? 'Bilgilendirildi' : 'Bekliyor'}
                         </span>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {alerts.length === 0 && (
             <div className="p-20 text-center text-stone-400 font-bold uppercase tracking-widest text-xs">Henüz bir talep yok.</div>
           )}
        </div>
      )}
    </div>
  );
}
