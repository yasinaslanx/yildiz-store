"use client";

import { useEffect, useState } from "react";
import { fetchAdminOrders, updateAdminOrderRequest } from "@/lib/api";

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingCity: string;
  shippingDistrict: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  items: {
    id: string;
    productName: string;
    brand: string;
    color: string;
    storage?: string | null;
    image: string;
    quantity: number;
    price: number;
    total: number;
  }[];
};

const orderStatuses = [
  { value: "PENDING", label: "Beklemede", color: "stone" },
  { value: "CONFIRMED", label: "Onaylandı", color: "blue" },
  { value: "SHIPPED", label: "Kargoda", color: "amber" },
  { value: "DELIVERED", label: "Teslim Edildi", color: "green" },
  { value: "CANCELLED", label: "İptal Edildi", color: "red" },
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (orderId: string, status: AdminOrder["status"]) => {
    try {
      setUpdatingId(orderId);
      await updateAdminOrderRequest(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert("Durum güncellenemedi");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredOrders = filterStatus === "ALL" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Operasyon</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Sipariş Yönetimi</h1>
           
           <div className="mt-8 flex items-center gap-4">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Filtrele:</span>
              <div className="flex gap-2">
                 {["ALL", ...orderStatuses.map(s => s.value)].map((status) => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                       filterStatus === status 
                         ? 'bg-stone-900 text-white shadow-lg shadow-stone-200' 
                         : 'bg-white text-stone-400 border border-stone-100 hover:border-stone-300'
                     }`}
                   >
                     {status === 'ALL' ? 'Tümü' : orderStatuses.find(s => s.value === status)?.label}
                   </button>
                 ))}
              </div>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-stone-100 rounded-2xl px-6 py-4 shadow-sm text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Bekleyen</p>
              <p className="text-xl font-black text-stone-900">{orders.filter(o => o.status === 'PENDING').length}</p>
           </div>
           <div className="bg-white border border-stone-100 rounded-2xl px-6 py-4 shadow-sm text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Toplam Ciro</p>
              <p className="text-xl font-black text-stone-900">{orders.reduce((s,o) => s + o.totalAmount, 0).toLocaleString()} ₺</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="space-y-6">
           {filteredOrders.length === 0 ? (
             <div className="rounded-[3rem] border border-dashed border-stone-200 p-24 text-center">
                <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Bu durumda sipariş bulunmuyor.</p>
             </div>
           ) : filteredOrders.map((order) => (
             <div key={order.id} className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-stone-100 transition-all duration-500">
                {/* Header Section */}
                <div className="bg-stone-50/50 px-10 py-6 border-b border-stone-50 flex flex-wrap items-center justify-between gap-6">
                   <div className="flex items-center gap-8">
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Sipariş No</p>
                         <p className="text-sm font-black text-stone-900 mt-0.5">#{order.orderNumber}</p>
                      </div>
                      <div className="h-8 w-px bg-stone-200 hidden sm:block" />
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Müşteri</p>
                         <p className="text-sm font-black text-stone-900 mt-0.5">{order.customerName}</p>
                      </div>
                      <div className="h-8 w-px bg-stone-200 hidden sm:block" />
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Konum</p>
                         <p className="text-sm font-black text-stone-900 mt-0.5">{order.shippingCity}, {order.shippingDistrict}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-2">
                         <div className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border ${
                            order.status === 'DELIVERED' ? 'border-green-500 bg-green-50 text-green-700' :
                            order.status === 'CANCELLED' ? 'border-red-500 bg-red-50 text-red-700' :
                            order.status === 'SHIPPED' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                            order.status === 'CONFIRMED' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                            'border-stone-400 bg-stone-50 text-stone-600'
                         }`}>
                            {orderStatuses.find(s => s.value === order.status)?.label}
                         </div>
                         
                         <div className="flex gap-2">
                            {order.status === 'PENDING' && (
                              <>
                                 <button 
                                   onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                   disabled={updatingId === order.id}
                                   className="rounded-xl bg-green-600 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-green-700 transition active:scale-95 disabled:opacity-50"
                                 >
                                    Onayla
                                 </button>
                                 <button 
                                   onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                   disabled={updatingId === order.id}
                                   className="rounded-xl border border-red-200 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition active:scale-95 disabled:opacity-50"
                                 >
                                    İptal Et
                                 </button>
                              </>
                            )}
                            {order.status === 'CONFIRMED' && (
                               <button 
                                 onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                                 disabled={updatingId === order.id}
                                 className="rounded-xl bg-blue-600 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                               >
                                  Kargoya Ver
                               </button>
                            )}
                            {order.status === 'SHIPPED' && (
                               <button 
                                 onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                                 disabled={updatingId === order.id}
                                 className="rounded-xl bg-stone-900 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black transition active:scale-95 disabled:opacity-50"
                               >
                                  Teslim Edildi İşaretle
                               </button>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Items Section */}
                <div className="p-10 flex flex-col md:flex-row gap-12">
                   <div className="flex-1 space-y-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-6 group">
                           <div className="h-16 w-16 rounded-2xl border border-stone-100 bg-white p-3 flex-shrink-0 group-hover:scale-110 transition duration-500">
                              <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black text-stone-900 uppercase tracking-widest">{item.productName}</p>
                              <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">{item.brand} / {item.color} {item.storage ? `/ ${item.storage}` : ''}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-black text-stone-900">{item.quantity} x {item.price.toLocaleString()} ₺</p>
                              <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">{item.total.toLocaleString()} ₺</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Summary & Contact */}
                   <div className="w-full md:w-80 space-y-6 bg-stone-50/50 rounded-3xl p-8 border border-stone-100">
                      <div className="space-y-4 pb-6 border-b border-stone-100">
                         <div className="flex justify-between">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ödeme Yöntemi</span>
                            <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{order.paymentMethod}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tarih</span>
                            <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Toplam</span>
                            <span className="text-lg font-black text-stone-900 tracking-tighter">{order.totalAmount.toLocaleString()} ₺</span>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">İletişim Bilgileri</p>
                         <p className="text-xs font-bold text-stone-900">{order.customerEmail}</p>
                         <p className="text-xs font-bold text-stone-900">{order.customerPhone}</p>
                      </div>
                      <button 
                        onClick={() => {
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          
                          const itemsHtml = order.items.map(item => `
                            <tr>
                              <td style="padding: 12px; border-bottom: 1px solid #eee;">
                                <div style="font-weight: bold;">${item.productName}</div>
                                <div style="font-size: 10px; color: #666;">${item.brand} / ${item.color} ${item.storage || ''}</div>
                              </td>
                              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} ₺</td>
                              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.total.toLocaleString()} ₺</td>
                            </tr>
                          `).join('');

                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Fatura - ${order.orderNumber}</title>
                                <style>
                                  body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                                  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
                                  .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
                                  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                                  .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 8px; }
                                  table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                                  th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #666; }
                                  .total-section { text-align: right; border-top: 2px solid #000; padding-top: 20px; }
                                  .total-amount { font-size: 24px; font-weight: 900; }
                                  @media print { .no-print { display: none; } }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="logo">YILDIZSTORE ★</div>
                                  <div style="text-align: right">
                                    <div style="font-weight: 900">FATURA</div>
                                    <div style="font-size: 12px; color: #666">No: ${order.orderNumber}</div>
                                  </div>
                                </div>
                                
                                <div class="info-grid">
                                  <div>
                                    <div class="section-title">Müşteri Bilgileri</div>
                                    <div style="font-weight: bold">${order.customerName}</div>
                                    <div>${order.customerEmail}</div>
                                    <div>${order.customerPhone}</div>
                                    <div style="margin-top: 8px">${order.shippingDistrict} / ${order.shippingCity}</div>
                                  </div>
                                  <div style="text-align: right">
                                    <div class="section-title">Sipariş Detayı</div>
                                    <div>Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                                    <div>Ödeme: ${order.paymentMethod}</div>
                                    <div>Durum: ${order.status}</div>
                                  </div>
                                </div>

                                <table>
                                  <thead>
                                    <tr>
                                      <th>Ürün Açıklaması</th>
                                      <th style="text-align: center">Adet</th>
                                      <th style="text-align: right">Birim Fiyat</th>
                                      <th style="text-align: right">Toplam</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${itemsHtml}
                                  </tbody>
                                </table>

                                <div class="total-section">
                                  <div class="section-title">Genel Toplam</div>
                                  <div class="total-amount">${order.totalAmount.toLocaleString()} ₺</div>
                                </div>

                                <div style="margin-top: 80px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                                  YıldızStore Premium Teknoloji Mağazası - Bu belge elektronik ortamda oluşturulmuştur.
                                </div>

                                <script>
                                  window.onload = () => {
                                    window.print();
                                    setTimeout(() => window.close(), 500);
                                  };
                                </script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }}
                        className="w-full rounded-2xl border-2 border-black bg-white py-3 text-[9px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition active:scale-95"
                      >
                         Detaylı Fatura Yazdır
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
