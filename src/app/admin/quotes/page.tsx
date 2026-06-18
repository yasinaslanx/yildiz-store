"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Quote = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  quoteStatus: "PENDING" | "APPROVED" | "REJECTED";
  quoteNote?: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [filter]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/quotes?status=${filter}`);
      const json = await res.json();
      if (json.success) {
        setQuotes(json.data);
      }
    } catch (err) {
      toast.error("Talepler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, status: string, newTotal?: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteStatus: status,
          ...(newTotal ? { totalAmount: newTotal } : {}),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Talep güncellendi");
        fetchQuotes();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Bir hata oluştu");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-stone-900 uppercase">İndirim Talepleri</h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest text-stone-400">
            Bayilerden gelen toplu alım indirim istekleri
          </p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              filter === status
                ? "bg-stone-900 text-white shadow-md"
                : "bg-white text-stone-400 hover:text-stone-900 border border-stone-100"
            }`}
          >
            {status === "PENDING" ? "Bekleyenler" : status === "APPROVED" ? "Onaylananlar" : status === "REJECTED" ? "Reddedilenler" : "Tümü"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-black" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-[3rem] border border-stone-100 bg-white p-20 text-center">
          <p className="text-lg font-black uppercase tracking-widest text-stone-300">Talep Bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded-[2.5rem] border border-stone-100 bg-white overflow-hidden shadow-sm">
              <div className="border-b border-stone-100 bg-stone-50/50 p-8 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Talep No</p>
                  <p className="text-sm font-black text-stone-900 mt-1">#{quote.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Bayi</p>
                  <p className="text-sm font-black text-stone-900 mt-1">{quote.customerName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Tarih</p>
                  <p className="text-sm font-black text-stone-900 mt-1">{new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      quote.quoteStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                      quote.quoteStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                   }`}>
                      {quote.quoteStatus === "PENDING" ? "Bekliyor" : quote.quoteStatus === "APPROVED" ? "Onaylandı" : "Reddedildi"}
                   </span>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-4">
                  {quote.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border border-stone-50 p-4 rounded-2xl">
                      <div className="h-12 w-12 bg-stone-50 rounded-xl p-1 flex-shrink-0">
                         <img src={item.image || "/placeholder.png"} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-black uppercase text-stone-900">{item.productName}</p>
                         <p className="text-[10px] font-bold text-stone-400">{item.quantity} Adet x {item.price} ₺</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 space-y-6 h-fit">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Talep Edilen Toplam</p>
                      <p className="text-3xl font-black text-center mt-2 text-stone-900 tracking-tighter">
                         {Number(quote.totalAmount).toLocaleString()} ₺
                      </p>
                   </div>
                   
                   {quote.quoteStatus === "PENDING" && (
                     <div className="space-y-3 pt-4 border-t border-stone-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Yeni Fiyat Teklifi Ver (₺)</p>
                        <input 
                           type="number" 
                           id={`new-price-${quote.id}`}
                           className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold outline-none"
                           placeholder="Mevcut fiyatı korumak için boş bırakın"
                        />
                        <button 
                           onClick={() => {
                              const el = document.getElementById(`new-price-${quote.id}`) as HTMLInputElement;
                              const newPrice = el?.value ? Number(el.value) : undefined;
                              handleUpdate(quote.id, "APPROVED", newPrice);
                           }}
                           disabled={updatingId === quote.id}
                           className="w-full bg-green-600 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition"
                        >
                           Onayla
                        </button>
                        <button 
                           onClick={() => handleUpdate(quote.id, "REJECTED")}
                           disabled={updatingId === quote.id}
                           className="w-full bg-white text-red-600 border border-red-200 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition"
                        >
                           Reddet
                        </button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
