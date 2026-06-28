"use client";

import { useEffect, useState } from "react";
import { DollarSign, Search, ArrowRight, UserCircle, Calculator, FileText } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Dealer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  balanceUSD: number;
  totalDebtUSD: number;
  totalPaymentUSD: number;
};

export default function LedgerPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Exchange rate toggle
  const [exchangeRate, setExchangeRate] = useState<number>(33.5);
  const [showInTL, setShowInTL] = useState(false);

  useEffect(() => {
    async function loadDealers() {
      try {
        const res = await fetch("/api/admin/pos/dealers");
        const data = await res.json();
        if (data.success) {
          setDealers(data.dealers);
        } else {
          toast.error("Cariler yüklenemedi.");
        }
      } catch (err) {
        toast.error("Hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    // Fetch live USD/TRY exchange rate (Sync with global header)
    fetch("https://finans.truncgil.com/today.json")
      .then(res => res.json())
      .then(data => {
        if (data.USD && data.USD.Satış) {
          const usdRate = parseFloat(data.USD.Satış.replace(",", "."));
          if (!isNaN(usdRate) && usdRate > 0) {
            setExchangeRate(usdRate);
          }
        }
      })
      .catch(console.error);

    loadDealers();
  }, []);

  const [hideZeroBalance, setHideZeroBalance] = useState(false);
  const [sortOrder, setSortOrder] = useState("name_asc");

  let filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  if (hideZeroBalance) {
    filteredDealers = filteredDealers.filter(d => Math.abs(d.balanceUSD) > 0.01);
  }

  filteredDealers.sort((a, b) => {
    if (sortOrder === "balance_desc") {
      return b.balanceUSD - a.balanceUSD;
    } else if (sortOrder === "balance_asc") {
      return a.balanceUSD - b.balanceUSD;
    } else {
      return a.name.localeCompare(b.name, 'tr-TR');
    }
  });

  const totalBalanceUSD = dealers.reduce((acc, d) => acc + d.balanceUSD, 0);
  const totalReceivablesUSD = dealers.filter(d => d.balanceUSD > 0).reduce((acc, d) => acc + d.balanceUSD, 0); // Bizim alacaklarımız (Dealers' debt)
  const totalPayablesUSD = dealers.filter(d => d.balanceUSD < 0).reduce((acc, d) => acc + Math.abs(d.balanceUSD), 0); // Bizim borçlarımız

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Ön Muhasebe</p>
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Cari Hesaplar</h1>
          <p className="text-stone-500 font-bold mt-2">Bayi Borç ve Bakiye Takip Paneli</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin/orders" className="flex items-center gap-3 bg-white text-stone-900 border-2 border-stone-200 px-5 py-3 h-[52px] rounded-2xl hover:border-stone-300 hover:bg-stone-50 transition shadow-sm">
             <FileText className="w-5 h-5 text-stone-400" />
             <div className="flex flex-col items-start leading-none gap-1">
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Tüm Faturalar</span>
               <span className="text-[9px] text-stone-400 normal-case tracking-normal">Görüntüle & Yazdır</span>
             </div>
          </Link>

          <div className="flex items-center gap-2 bg-white px-4 py-3 h-[52px] rounded-2xl border border-stone-200 shadow-sm">
             <Calculator className="w-5 h-5 text-stone-400" />
             <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase text-stone-400 leading-none">Döviz Kuru (USD/TRY)</span>
               <input 
                 type="number" 
                 step="0.01"
                 value={exchangeRate}
                 onChange={(e) => setExchangeRate(Number(e.target.value))}
                 className="w-16 outline-none font-black text-stone-900 leading-none mt-1"
               />
             </div>
          </div>
          <button 
            onClick={() => setShowInTL(!showInTL)}
            className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${showInTL ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-900"}`}
          >
            {showInTL ? "TRY Gösteriliyor" : "USD Gösteriliyor"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm md:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Toplam Alacak (Bize Olan Borçlar)</p>
            <p className="text-3xl font-black text-red-600">
               {showInTL ? "₺" : "$"}{(showInTL ? totalReceivablesUSD * exchangeRate : totalReceivablesUSD).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </p>
         </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between bg-stone-50/50 gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari adı veya e-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-white border border-stone-200 rounded-xl px-4 py-3 pl-11 text-sm font-bold focus:border-stone-900 outline-none transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-600 bg-white px-4 py-3 rounded-xl border border-stone-200 shadow-sm hover:bg-stone-50 transition select-none">
              <input 
                type="checkbox" 
                checked={hideZeroBalance} 
                onChange={e => setHideZeroBalance(e.target.checked)} 
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer" 
              />
              Sıfır Bakiyelileri Gizle
            </label>
            
            <select 
              value={sortOrder} 
              onChange={e => setSortOrder(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold text-stone-600 focus:border-stone-900 outline-none transition cursor-pointer shadow-sm appearance-none pr-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
            >
              <option value="name_asc">Alfabetik (A-Z)</option>
              <option value="balance_desc">Borca Göre (Çoktan Aza)</option>
              <option value="balance_asc">Borca Göre (Azdan Çoğa)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
              <tr>
                <th className="p-4 pl-6">Cari Adı</th>
                <th className="p-4">İletişim</th>
                <th className="p-4 text-right">Durum</th>
                <th className="p-4 text-right">Borç</th>
                <th className="p-4 text-right">Tahsilat</th>
                <th className="p-4 text-right">Net Kalan</th>
                <th className="p-4 pr-6 w-32 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm font-bold">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-stone-400">Yükleniyor...</td>
                </tr>
              ) : filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-stone-400 uppercase tracking-widest">Cari hesap bulunamadı.</td>
                </tr>
              ) : (
                filteredDealers.map(dealer => {
                  const val = showInTL ? dealer.balanceUSD * exchangeRate : dealer.balanceUSD;
                  const formattedVal = (showInTL ? "₺" : "$") + Math.abs(val).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
                  
                  return (
                    <tr key={dealer.id} className="hover:bg-stone-50 transition group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-8 h-8 text-stone-300" />
                          <span className={`uppercase ${dealer.balanceUSD > 0 ? 'text-red-600' : 'text-stone-900'}`}>{dealer.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-stone-600">{dealer.phone || "-"}</div>
                        <div className="text-[10px] text-stone-400 font-medium">{dealer.email}</div>
                      </td>
                      <td className="p-4 text-right">
                        {dealer.balanceUSD > 0 ? (
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] uppercase tracking-widest">Borçlu</span>
                        ) : dealer.balanceUSD < 0 ? (
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] uppercase tracking-widest">Alacaklı</span>
                        ) : (
                          <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest">Temiz</span>
                        )}
                      </td>
                      <td className={`p-4 text-right font-medium text-stone-600`}>
                        {showInTL ? "₺" : "$"}{(showInTL ? dealer.totalDebtUSD * exchangeRate : dealer.totalDebtUSD).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 text-right font-medium text-stone-600`}>
                        {showInTL ? "₺" : "$"}{(showInTL ? dealer.totalPaymentUSD * exchangeRate : dealer.totalPaymentUSD).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-4 text-right text-lg font-black ${dealer.balanceUSD > 0 ? "text-red-600" : dealer.balanceUSD < 0 ? "text-green-600" : "text-stone-400"}`}>
                        {formattedVal} {dealer.balanceUSD > 0 ? "(B)" : dealer.balanceUSD < 0 ? "(A)" : ""}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <Link 
                          href={`/admin/pos/dealers/${dealer.id}/ledger`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-900 rounded-xl transition text-[10px] font-black uppercase tracking-widest"
                        >
                          Ekstre <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
