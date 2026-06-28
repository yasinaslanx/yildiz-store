"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SunixLogo } from "@/components/layout/sunix-logo";
import QRCode from "qrcode";

type Transaction = {
  id: string;
  type: "DEBT" | "PAYMENT";
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
};

type Dealer = {
  name: string;
  email: string;
  phone: string;
};

export default function LedgerPrintPage() {
  const params = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const hasPrinted = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/pos/dealers/${params.id}/ledger`);
        const data = await res.json();
        if (data.success && isMounted) {
          // Sort oldest first for ekstre
          const sorted = [...(data.transactions || [])].sort(
            (a: Transaction, b: Transaction) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setTransactions(sorted);
          if (data.dealer) setDealer(data.dealer);

          // QR Kod
          const ledgerUrl = `${window.location.origin}/admin/pos/dealers/${params.id}/ledger`;
          const qr = await QRCode.toDataURL(ledgerUrl, { width: 80, margin: 1 });
          if (isMounted) setQrDataUrl(qr);

          setTimeout(() => {
            if (isMounted && !hasPrinted.current) {
              window.print();
              hasPrinted.current = true;
            }
          }, 600);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();

    return () => { isMounted = false; };
  }, [params.id]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!dealer && transactions.length === 0) return <div className="p-10 text-center">Kayıt bulunamadı.</div>;

  // Kümülatif bakiye hesapla
  let runningBalance = 0;
  const txsWithBalance = transactions.map((t) => {
    runningBalance = t.type === "DEBT"
      ? runningBalance + Number(t.amount)
      : runningBalance - Number(t.amount);
    return { ...t, runningBalance };
  });

  const finalBalance = runningBalance;

  // WhatsApp
  const docUrl = typeof window !== "undefined"
    ? `${window.location.origin}/admin/pos/dealers/${params.id}/ledger/print`
    : "";
  const rawPhone = dealer?.phone?.replace(/\D/g, "") || "";
  const whatsappMsg = encodeURIComponent(
    `Sayın ${dealer?.name || "Bayi"}, güncel cari hesap ekstrenizi aşağıdaki linkten görüntüleyebilirsiniz:\n${docUrl}`
  );
  const whatsappUrl = rawPhone
    ? `https://wa.me/90${rawPhone}?text=${whatsappMsg}`
    : `https://wa.me/?text=${whatsappMsg}`;

  const today = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="bg-white min-h-screen text-black font-sans print-page"
      style={{ WebkitPrintColorAdjust: "exact", colorAdjust: "exact" }}
    >
      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print-page { padding: 20px; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
        @media screen {
          .no-print { display: flex; }
        }
      ` }} />

      {/* WhatsApp Butonu */}
      <div className="no-print fixed top-4 right-4 z-50 gap-2 items-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-[#1ebe5d] transition"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          WhatsApp ile Gönder
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* HEADER */}
        <div className="grid grid-cols-3 gap-4 items-end mb-4">
          <div className="flex flex-col items-start gap-4">
            <div className="text-[#1e3a8a] scale-75 origin-left"><SunixLogo /></div>
            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">BÖLGE ANA BAYİLİĞİ</h1>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-[#1e3a8a] scale-[2.5] origin-bottom mb-2"><SunixLogo /></div>
            <p className="text-[10px] font-bold text-[#1e3a8a] text-center uppercase leading-tight max-w-[280px]">
              HASAN ÇELEBİ MAH HACI YUSUF SAMİ CAD 12/A SİVEREK ŞANLIURFA
            </p>
          </div>
          <div className="flex flex-col items-end gap-6 pb-1">
            <div className="text-right">
              <h2 className="text-base font-black uppercase tracking-tight">SUNİX MAĞAZA MERKEZ</h2>
              <p className="text-base font-black">05400828263</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center p-[2px]">
                <div className="w-full h-full border-[1.5px] border-white rounded-[4px]"></div>
              </div>
              <span className="text-xs font-bold">sunixstore</span>
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="flex items-center justify-center mb-8 relative">
          <div className="absolute w-full h-[1.5px] bg-[#cc0000]"></div>
          <h2 className="text-xl font-black text-[#cc0000] uppercase tracking-wider bg-white px-6 relative z-10">
            CARİ HESAP EKSTRESİ
          </h2>
        </div>

        {/* BAYİ BİLGİLERİ */}
        <div className="flex justify-between text-[11px] font-bold mb-8">
          <table className="w-[350px]">
            <tbody>
              <tr>
                <td className="w-20 uppercase pb-1">SAYIN</td>
                <td className="w-4 pb-1">:</td>
                <td className="text-blue-700 uppercase pb-1">{dealer?.name || "-"}</td>
              </tr>
              <tr>
                <td className="uppercase pb-1">CEP TEL</td>
                <td className="pb-1">:</td>
                <td className="text-blue-700 pb-1">{dealer?.phone || "-"}</td>
              </tr>
              <tr>
                <td className="uppercase pb-1">E-POSTA</td>
                <td className="pb-1">:</td>
                <td className="pb-1">{dealer?.email || "-"}</td>
              </tr>
            </tbody>
          </table>
          <table className="w-[200px]">
            <tbody>
              <tr>
                <td className="w-24 text-right pb-1">Düzenleme Tarihi</td>
                <td className="w-4 text-center pb-1">:</td>
                <td className="text-right pb-1">{today}</td>
              </tr>
              <tr>
                <td className="text-right pb-1">Güncel Bakiye</td>
                <td className="text-center pb-1">:</td>
                <td className={`text-right pb-1 font-black ${finalBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {finalBalance.toFixed(2).replace(".", ",")} USD
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AÇILIŞ BAKİYESİ */}
        <div className="mb-2 text-[11px] font-bold flex justify-between border border-stone-200 rounded px-3 py-2 bg-stone-50">
          <span className="uppercase tracking-widest">Açılış Bakiyesi</span>
          <span>0,00 USD</span>
        </div>

        {/* HAREKETLER TABLOSU */}
        <table className="w-full text-[10px] font-bold mb-4 border-collapse">
          <thead>
            <tr className="text-[#cc0000]">
              <th className="py-2 text-left border-b-[1.5px] border-[#cc0000] w-28">Tarih</th>
              <th className="py-2 text-left border-b-[1.5px] border-[#cc0000]">Açıklama</th>
              <th className="py-2 text-center border-b-[1.5px] border-[#cc0000] w-28">Borç (USD)</th>
              <th className="py-2 text-center border-b-[1.5px] border-[#cc0000] w-28">Alacak (USD)</th>
              <th className="py-2 text-center border-b-[1.5px] border-[#cc0000] w-28">Bakiye (USD)</th>
            </tr>
          </thead>
          <tbody>
            {txsWithBalance.map((t, i) => (
              <tr key={t.id} className={i % 2 === 1 ? "bg-[#f0f4ff]" : ""}>
                <td className="py-1.5 px-1">
                  {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="py-1.5 px-1 uppercase">{t.description}</td>
                <td className="py-1.5 px-1 text-center text-red-600">
                  {t.type === "DEBT" ? Number(t.amount).toFixed(2).replace(".", ",") : "-"}
                </td>
                <td className="py-1.5 px-1 text-center text-green-600">
                  {t.type === "PAYMENT" ? Number(t.amount).toFixed(2).replace(".", ",") : "-"}
                </td>
                <td className={`py-1.5 px-1 text-center font-black ${t.runningBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {t.runningBalance.toFixed(2).replace(".", ",")}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-stone-400">
                  Henüz cari hareket bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* KAPANIŞ BAKİYESİ */}
        <div className="flex justify-end text-[11px] font-bold mt-4">
          <table className="w-[280px]">
            <tbody>
              <tr>
                <td colSpan={3} className="py-1">
                  <div className="w-full border-b-[1.5px] border-[#cc0000]"></div>
                </td>
              </tr>
              <tr className="text-[#cc0000]">
                <td className="text-right py-2">KAPANIŞ BAKİYESİ</td>
                <td className="text-center py-2 w-6">:</td>
                <td className="text-right py-2 font-black">
                  {finalBalance.toFixed(2).replace(".", ",")} USD
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right py-1 text-[9px] text-stone-400">
                  {finalBalance > 0
                    ? "Borçlu bakiye - tahsilat beklemektedir."
                    : finalBalance < 0
                    ? "Alacaklı bakiye - fazla ödeme yapılmıştır."
                    : "Hesap kapalıdır, bakiye sıfırdır."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* İMZA & KAŞE */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-[10px] font-bold uppercase">
          <div className="flex flex-col items-center gap-2">
            <div className="w-full border-b border-black h-10"></div>
            <span className="tracking-widest text-stone-500">TESLİM EDEN</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-full border border-dashed border-stone-300 h-10 flex items-center justify-center">
              <span className="text-stone-300 tracking-widest">KAŞE</span>
            </div>
            <span className="tracking-widest text-stone-500">FİRMA KAŞE/İMZA</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-full border-b border-black h-10"></div>
            <span className="tracking-widest text-stone-500">TESLİM ALAN</span>
          </div>
        </div>

        {/* QR KOD */}
        {qrDataUrl && (
          <div className="mt-10 flex justify-between items-end">
            <p className="text-[9px] text-stone-400 max-w-[300px] leading-relaxed">
              Bu ekstre Sunix Mağaza Merkez tarafından {today} tarihinde düzenlenmiştir.
              Cari hareketleri doğrulamak için QR kodu okutunuz.
            </p>
            <div className="flex flex-col items-center gap-1">
              <img src={qrDataUrl} alt="Cari Hesap QR Kodu" className="w-20 h-20" />
              <span className="text-[8px] text-stone-400 uppercase tracking-widest">Cari Hesap Doğrulama</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
