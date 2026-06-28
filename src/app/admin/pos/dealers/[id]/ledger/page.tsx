"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

type Transaction = {
  id: string;
  type: "DEBT" | "PAYMENT";
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
};

export default function DealerLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dealer, setDealer] = useState<{name: string, email: string, phone: string} | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Payment Form
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [params.id]);

  async function loadTransactions() {
    try {
      // Varsayılan bir API ucu farzediyoruz
      const res = await fetch(`/api/admin/pos/dealers/${params.id}/ledger`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        if (data.dealer) setDealer(data.dealer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error("Geçerli bir tutar girin.");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pos/dealers/${params.id}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAYMENT",
          amount: Number(amount),
          description: description || "Nakit Tahsilat"
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ödeme (Tahsilat) eklendi.");
        setAmount("");
        setDescription("");
        loadTransactions();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  const balance = transactions.reduce((acc, t) => {
    return t.type === "DEBT" ? acc + Number(t.amount) : acc - Number(t.amount);
  }, 0);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
      </div>
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tighter italic">
             {dealer ? dealer.name : "CARİ HESAP EKSTRESİ"}
           </h1>
           <p className="text-stone-500 font-bold mt-1">
             {dealer ? "Cari Hesap Ekstresi ve İşlem Geçmişi" : "Bayi Bakiyesi ve İşlem Geçmişi"}
           </p>
        </div>
        <div className="text-right">
           <p className="text-xs font-black uppercase tracking-widest text-stone-400">Güncel Borç (Bakiye)</p>
           <p className={`text-4xl font-black ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>${balance.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleAddPayment} className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex gap-4 items-end">
         <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-400">Ödeme Tutarı (USD)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-stone-900"
              placeholder="0.00"
            />
         </div>
         <div className="flex-[2] space-y-2">
            <label className="text-[10px] font-black uppercase text-stone-400">Açıklama (İsteğe Bağlı)</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-stone-900"
              placeholder="Örn: Elden nakit alındı"
            />
         </div>
         <button 
           disabled={submitting}
           className="bg-stone-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-stone-800 transition disabled:opacity-50"
         >
           {submitting ? "Ekleniyor..." : "Tahsilat Ekle"}
         </button>
      </form>

      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-400">
             <tr>
               <th className="p-4">Tarih</th>
               <th className="p-4">İşlem Tipi</th>
               <th className="p-4">Açıklama</th>
               <th className="p-4 text-right">Borç (Alışveriş)</th>
               <th className="p-4 text-right">Alacak (Ödeme)</th>
               <th className="p-4 text-right">Kalan Bakiye</th>
               <th className="p-4 text-right">Belge</th>
             </tr>
           </thead>
           <tbody className="text-sm font-bold divide-y divide-stone-100">
             {(() => {
               // Calculate running balance
               const reversed = [...transactions].reverse();
               let currentBalance = 0;
               const txsWithBalance = reversed.map(t => {
                 currentBalance = t.type === "DEBT" ? currentBalance + Number(t.amount) : currentBalance - Number(t.amount);
                 return { ...t, runningBalance: currentBalance };
               }).reverse();

               return txsWithBalance.map(t => (
                 <tr key={t.id} className="hover:bg-stone-50/50 transition">
                   <td className="p-4">{new Date(t.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                   <td className="p-4">
                     <span className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest ${t.type === "DEBT" ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                       {t.type === "DEBT" ? "Toptan Satış" : "Tahsilat / Ödeme"}
                     </span>
                   </td>
                   <td className="p-4 text-stone-600">{t.description}</td>
                   <td className="p-4 text-right text-red-600">{t.type === "DEBT" ? `$${Number(t.amount).toFixed(2)}` : "-"}</td>
                   <td className="p-4 text-right text-green-600">{t.type === "PAYMENT" ? `$${Number(t.amount).toFixed(2)}` : "-"}</td>
                   <td className={`p-4 text-right ${t.runningBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>${t.runningBalance.toFixed(2)}</td>
                   <td className="p-4 text-right">
                     {t.type === "DEBT" && t.orderId ? (
                       <a href={`/admin/pos/${t.orderId}/print`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-stone-900 hover:text-blue-600 underline underline-offset-2">Faturayı Yazdır</a>
                     ) : t.type === "PAYMENT" ? (
                       <a href={`/admin/pos/transactions/${t.id}/print`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-green-700 hover:text-green-900 underline underline-offset-2">Makbuz Yazdır</a>
                     ) : "-"}
                   </td>
                 </tr>
               ));
             })()}
             {transactions.length === 0 && (
               <tr><td colSpan={7} className="p-8 text-center text-stone-400">Henüz cari işlem bulunmuyor.</td></tr>
             )}
           </tbody>
         </table>
      </div>
    </div>
  );
}
