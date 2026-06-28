"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SunixLogo } from "@/components/layout/sunix-logo";

type PrintTransaction = {
  id: string;
  amount: number; // In USD
  createdAt: string;
  description: string;
  user?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }
};

export default function TransactionPrintPage() {
  const params = useParams<{ txId: string }>();
  const [transaction, setTransaction] = useState<PrintTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const hasPrinted = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/admin/pos/transactions/${params.txId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setTransaction(data.transaction);
          setTimeout(() => {
            if (isMounted && !hasPrinted.current) {
              window.print();
              hasPrinted.current = true;
            }
          }, 500);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTransaction();

    return () => {
      isMounted = false;
    };
  }, [params.txId]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!transaction) return <div className="p-10 text-center">İşlem bulunamadı.</div>;

  return (
    <div className="bg-white min-h-screen text-black font-sans print-page" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
      
      {/* Özel Print CSS'i */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print-page { padding: 20px; }
          /* Tarayıcı varsayılan header/footer'ını gizle */
          @page { margin: 0; size: A4; }
        }
      `}} />

      <div className="max-w-4xl mx-auto p-8">
         {/* HEADER ROWS */}
         <div className="grid grid-cols-3 gap-4 items-end mb-4">
            {/* Left */}
            <div className="flex flex-col items-start gap-4">
               <div className="text-[#1e3a8a] scale-75 origin-left"><SunixLogo /></div>
               <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">BÖLGE ANA BAYİLİĞİ</h1>
            </div>
            
            {/* Middle */}
            <div className="flex flex-col items-center gap-2">
               <div className="text-[#1e3a8a] scale-[2.5] origin-bottom mb-2"><SunixLogo /></div>
               <p className="text-[10px] font-bold text-[#1e3a8a] text-center uppercase leading-tight max-w-[280px]">
                 HASAN ÇELEBİ MAH HACI YUSUF SAMİ CAD 12/A SİVEREK ŞANLIURFA
               </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-6 pb-1">
               <div className="text-right">
                 <h2 className="text-base font-black uppercase tracking-tight">SUNİX MAĞAZA MERKEZ</h2>
                 <p className="text-base font-black">05400828263</p>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center p-[2px]">
                   <div className="w-full h-full border-[1.5px] border-white rounded-[4px]"></div>
                 </div>
                 <span className="text-xs font-bold mt-0.5">sunixstore</span>
               </div>
            </div>
         </div>

         {/* TITLE */}
         <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute w-full h-[1.5px] bg-[#cc0000]"></div>
            <h2 className="text-xl font-black text-[#cc0000] uppercase tracking-wider bg-white px-6 relative z-10">TAHSİLAT MAKBUZU</h2>
         </div>

         {/* MÜŞTERİ BİLGİLERİ */}
         <div className="flex justify-between text-[11px] font-bold mb-8">
            <table className="w-[350px]">
              <tbody>
                <tr>
                  <td className="w-20 uppercase pb-1">SAYIN</td>
                  <td className="w-4 pb-1">:</td>
                  <td className="text-blue-700 uppercase pb-1">{transaction.user ? `${transaction.user.firstName} ${transaction.user.lastName}` : "-"}</td>
                </tr>
                <tr>
                  <td className="uppercase pb-1">CEP TEL</td>
                  <td className="pb-1">:</td>
                  <td className="text-blue-700 pb-1">{transaction.user?.phone || "-"}</td>
                </tr>
                <tr>
                  <td className="uppercase pb-1">ADRES</td>
                  <td className="pb-1">:</td>
                  <td className="pb-1">{transaction.user?.address || "Merkez Mağaza"}</td>
                </tr>
              </tbody>
            </table>
            
            <table className="w-[200px]">
              <tbody>
                <tr>
                  <td className="w-20 text-right pb-1">Belge Tarihi</td>
                  <td className="w-4 text-center pb-1">:</td>
                  <td className="text-right pb-1">{new Date(transaction.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
                <tr>
                  <td className="text-right pb-1">İşlem No</td>
                  <td className="text-center pb-1">:</td>
                  <td className="text-right pb-1">TH-{new Date(transaction.createdAt).getTime().toString().slice(-6)}</td>
                </tr>
              </tbody>
            </table>
         </div>

         {/* TABLO */}
         <table className="w-full text-[11px] font-bold mb-8 border-collapse">
            <thead>
               <tr className="text-[#cc0000]">
                 <th className="py-2 text-left border-b-[1.5px] border-[#cc0000]">İşlem Tipi</th>
                 <th className="py-2 text-left border-b-[1.5px] border-[#cc0000]">Açıklama</th>
                 <th className="py-2 text-center border-b-[1.5px] border-[#cc0000]">TUTAR USD $</th>
               </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2.5 px-1 uppercase">NAKİT TAHSİLAT</td>
                <td className="py-2.5 px-1 uppercase">{transaction.description || "-"}</td>
                <td className="py-2.5 px-1 text-center font-black">{Number(transaction.amount).toFixed(2).replace('.', ',')}</td>
              </tr>
            </tbody>
         </table>

         {/* TOPLAMLAR */}
         <div className="flex justify-end text-[11px] font-bold mt-10">
            <table className="w-[250px]">
               <tbody>
                  <tr>
                    <td className="text-right py-1">ALINAN TAHSİLAT</td>
                    <td className="text-center w-6 py-1">:</td>
                    <td className="text-right py-1">{Number(transaction.amount).toFixed(2).replace('.', ',')} USD</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-right py-2 text-stone-500">Bu makbuz yalnızca ödeme tahsilatını teyit etmek amacıyla düzenlenmiştir.</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
