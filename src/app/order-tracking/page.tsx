"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Truck, CheckCircle, Clock, XCircle, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

type OrderItem = {
  id: string;
  productName: string;
  brand: string;
  color: string;
  storage: string | null;
  quantity: number;
  price: number;
  image: string | null;
};

type TrackingData = {
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  customerName: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: OrderItem[];
};

const STATUS_STEPS = [
  { id: "PENDING", label: "Sipariş Alındı", icon: Clock },
  { id: "PROCESSING", label: "Hazırlanıyor", icon: Package },
  { id: "SHIPPED", label: "Kargoya Verildi", icon: Truck },
  { id: "DELIVERED", label: "Teslim Edildi", icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber || !email) {
      toast.error("Lütfen sipariş numarası ve e-posta adresinizi girin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/order-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackingData(data.data);
      } else {
        toast.error(data.message || "Sipariş bulunamadı.");
      }
    } catch (err) {
      toast.error("Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const getCurrentStepIndex = (status: string) => {
    return STATUS_STEPS.findIndex(step => step.id === status);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-b from-stone-200/50 to-transparent rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-t from-stone-200/50 to-transparent rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="mx-auto max-w-4xl px-6 py-20 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-stone-900 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-stone-300"
          >
            <Package className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 italic">Sipariş Takibi</h1>
          <p className="text-stone-500 font-medium max-w-lg mx-auto">Siparişinizin güncel durumunu öğrenmek için sipariş numaranızı ve e-posta adresinizi girin.</p>
        </div>

        <AnimatePresence mode="wait">
          {!trackingData ? (
            <motion.div 
              key="search-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
            >
              <form onSubmit={handleSearch} className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-stone-200/50 border border-white space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-2">Sipariş Numarası</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={orderNumber}
                         onChange={(e) => setOrderNumber(e.target.value)}
                         placeholder="Örn: ORD-123456789"
                         className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-5 text-sm font-bold focus:bg-white focus:border-stone-900 outline-none transition"
                       />
                       <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-2">E-Posta Adresi</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Siparişi oluştururken kullandığınız e-posta"
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-5 text-sm font-bold focus:bg-white focus:border-stone-900 outline-none transition"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-stone-900 text-white rounded-full py-6 text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-stone-900/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Siparişi Sorgula"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="tracking-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-stone-200/50 border border-white overflow-hidden"
            >
              {/* Header */}
              <div className="bg-stone-900 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 italic mb-2">Sipariş Özeti</p>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">#{trackingData.orderNumber}</h2>
                    <p className="text-sm font-medium text-stone-400 mt-2">Sayın {trackingData.customerName}</p>
                 </div>
                 <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 italic mb-2">Sipariş Tarihi</p>
                    <p className="text-lg font-bold">{new Date(trackingData.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 </div>
              </div>

              {/* Status Stepper */}
              <div className="p-8 md:p-16 border-b border-stone-100">
                 {trackingData.status === "CANCELLED" ? (
                   <div className="flex flex-col items-center justify-center text-red-500 py-10 space-y-4">
                      <XCircle className="w-16 h-16" />
                      <h3 className="text-2xl font-black uppercase tracking-tight italic">Sipariş İptal Edildi</h3>
                      <p className="text-stone-500 font-medium">Bu sipariş iptal edilmiştir. Detaylı bilgi için müşteri hizmetleri ile iletişime geçebilirsiniz.</p>
                   </div>
                 ) : (
                   <div className="relative">
                      {/* Line */}
                      <div className="absolute top-1/2 left-0 w-full h-1.5 bg-stone-100 rounded-full -translate-y-1/2 hidden md:block" />
                      
                      {/* Active Line */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(getCurrentStepIndex(trackingData.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-1/2 left-0 h-1.5 bg-stone-900 rounded-full -translate-y-1/2 hidden md:block" 
                      />

                      <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                         {STATUS_STEPS.map((step, index) => {
                           const isCompleted = getCurrentStepIndex(trackingData.status) >= index;
                           const isCurrent = getCurrentStepIndex(trackingData.status) === index;
                           const Icon = step.icon;

                           return (
                             <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-6 relative z-10">
                                <motion.div 
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: index * 0.2 }}
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 shadow-xl ${
                                    isCurrent ? "bg-stone-900 text-white shadow-stone-900/20 scale-110" :
                                    isCompleted ? "bg-stone-900 text-white" : "bg-white border-2 border-stone-100 text-stone-300"
                                  }`}
                                >
                                   <Icon className="w-6 h-6" />
                                </motion.div>
                                <div className="text-left md:text-center">
                                   <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</p>
                                   {isCurrent && <p className="text-[10px] font-bold text-stone-400 uppercase mt-1">Şu Anki Durum</p>}
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                 )}

                 {trackingData.status === "SHIPPED" && trackingData.trackingNumber && (
                   <div className="mt-16 bg-stone-50 rounded-3xl p-8 border border-stone-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Truck className="w-5 h-5 text-stone-900" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Kargo Firması</p>
                            <p className="text-lg font-black text-stone-900 uppercase italic tracking-tight">{trackingData.shippingCarrier}</p>
                         </div>
                      </div>
                      <div className="text-center md:text-left">
                         <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Takip Numarası</p>
                         <p className="text-lg font-black text-stone-900 tracking-wider">{trackingData.trackingNumber}</p>
                      </div>
                      {trackingData.trackingUrl && (
                        <a 
                          href={trackingData.trackingUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full md:w-auto bg-stone-900 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                        >
                          Kargo Takibi Yap <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                   </div>
                 )}
              </div>

              {/* Order Items */}
              <div className="p-8 md:p-12">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-8">Sipariş İçeriği</h3>
                 <div className="space-y-6">
                    {trackingData.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 bg-stone-50/50 p-4 pr-8 rounded-3xl border border-stone-100">
                         <div className="w-24 h-24 relative bg-white rounded-2xl border border-stone-100 overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.productName} fill className="object-contain p-4" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-200">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{item.brand}</p>
                            <p className="text-sm font-black uppercase tracking-tight text-stone-900 truncate">{item.productName}</p>
                            <div className="flex items-center gap-3 mt-2">
                               <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{item.color}</span>
                               {item.storage && (
                                 <>
                                   <span className="w-1 h-1 rounded-full bg-stone-300" />
                                   <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{item.storage}</span>
                                 </>
                               )}
                               <span className="w-1 h-1 rounded-full bg-stone-300" />
                               <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{item.quantity} Adet</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-black text-stone-900 tracking-tight">{(item.price * item.quantity).toLocaleString("tr-TR")} ₺</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 flex items-center justify-between pt-8 border-t border-stone-100">
                    <button 
                      onClick={() => setTrackingData(null)}
                      className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 hover:text-stone-900 transition"
                    >
                      <ArrowLeft className="w-4 h-4" /> Başka Sorgula
                    </button>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Genel Toplam</p>
                       <p className="text-3xl font-black text-stone-900 tracking-tighter italic">{trackingData.totalAmount.toLocaleString("tr-TR")} ₺</p>
                    </div>
                 </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
