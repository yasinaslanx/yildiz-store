"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { SunixLogo } from "@/components/layout/sunix-logo";

type OrderItem = {
  id: string;
  variantId: string;
  productName: string;
  brand: string;
  quantity: number;
  price: number; // In USD
  variant: {
    sku: string;
  }
};

type PrintOrder = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  totalAmount: number; // TRY
  exchangeRate: number;
  discountAmount: number;
  items: OrderItem[];
  user?: {
    dealerTransactions: { type: string, amount: number }[]
  }
};

export default function PosPrintPage() {
  const params = useParams();
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // We will need a specific API route to fetch this or use an existing one if it returns the right data
        // Let's create a specialized API or use a generic one. For now, I'll fetch via a new dedicated GET endpoint.
        const res = await fetch(`/api/admin/pos/order/${params.orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
          // Wait a bit for images to load, then trigger print
          setTimeout(() => {
            window.print();
          }, 1000);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.orderId]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!order) return <div className="p-10 text-center">Sipariş bulunamadı.</div>;

  // Hesaplamalar (USD)
  const sayfaToplami = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const indirimUSD = Number(order.discountAmount);
  const toplamUSD = sayfaToplami - indirimUSD;

  // Eski Bakiye Hesaplama
  let eskiBakiye = 0;
  if (order.user && order.user.dealerTransactions) {
    order.user.dealerTransactions.forEach((t: any) => {
      // Sadece bu siparişten ÖNCEKİ işlemleri baz almalıyız, ama şimdilik mevcut bakiyeyi yazdırabiliriz
      // Ancak mantıken bu siparişin borcu da eklendi. O yüzden bu siparişin tutarını çıkararak "Eski Bakiye"yi bulalım.
      if (t.type === "DEBT") eskiBakiye += Number(t.amount);
      if (t.type === "PAYMENT") eskiBakiye -= Number(t.amount);
    });
    // Bu siparişin toplamını eski bakiyeden düşersek, sipariş anındaki eski bakiyeyi buluruz.
    eskiBakiye = eskiBakiye - toplamUSD;
  }

  const genelToplam = eskiBakiye + toplamUSD;

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
         {/* HEADER */}
         <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
               <div className="text-[#1e3a8a] mb-2 scale-75 origin-top-left"><SunixLogo /></div>
               <h1 className="text-xl font-bold tracking-tight mb-1">BÖLGE ANA BAYİLİĞİİ</h1>
               <p className="text-[11px] font-semibold text-[#1e3a8a] max-w-[250px] uppercase">
                 HASAN ÇELEBİ MAH HACI YUSUF SAMİ CAD 12/A SİVEREK ŞANLIURFA
               </p>
            </div>
            
            <div className="flex-1 flex justify-center">
               <div className="text-[#1e3a8a] scale-150 origin-top"><SunixLogo /></div>
            </div>

            <div className="flex-1 text-right">
               <h2 className="text-lg font-black uppercase">SUNİX MAĞAZA MERKEZ</h2>
               <p className="text-lg font-black mb-4">05400828263</p>
               <p className="text-xs font-bold flex items-center justify-end gap-1">
                 <span className="text-red-500 text-lg">©</span> sunixstore
               </p>
            </div>
         </div>

         {/* SİPARİŞ FİŞİ TİTLE */}
         <div className="border-t-2 border-red-600 mb-6 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-red-600 font-bold text-lg">
               SİPARİŞ FİŞİ
            </div>
         </div>

         {/* MÜŞTERİ BİLGİLERİ */}
         <div className="flex justify-between text-[11px] font-bold mb-8 mt-10">
            <div className="space-y-1">
               <div className="flex"><span className="w-20 uppercase">SAYIN</span> <span>: <span className="text-blue-700 uppercase">{order.customerName}</span></span></div>
               <div className="flex"><span className="w-20 uppercase">CEP TEL</span> <span>: <span className="text-blue-700">{order.customerPhone || "-"}</span></span></div>
               <div className="flex"><span className="w-20 uppercase">ADRES</span> <span>: {order.shippingAddress || "-"}</span></div>
            </div>
            <div className="space-y-1 text-right">
               <div className="flex justify-end"><span className="w-24 text-left">Fiş Tarihi</span> <span>: {new Date(order.createdAt).toLocaleDateString('tr-TR')}</span></div>
               <div className="flex justify-end"><span className="w-24 text-left">Fiş No</span> <span>: {order.orderNumber.replace('POS-', '')}</span></div>
            </div>
         </div>

         {/* TABLO */}
         <table className="w-full text-[11px] font-bold mb-8 border-collapse">
            <thead>
               <tr className="border-b border-red-600 text-red-600">
                 <th className="py-2 text-left w-32">Barkod</th>
                 <th className="py-2 text-left">Stok Adı</th>
                 <th className="py-2 text-right w-20">Miktar</th>
                 <th className="py-2 text-right w-24">Birim</th>
                 <th className="py-2 text-right w-32">TUTAR USD $</th>
               </tr>
            </thead>
            <tbody>
               {order.items.map((item, i) => (
                 <tr key={item.id} className={i % 2 === 1 ? 'bg-[#E5E7FA]/30' : ''}>
                   <td className="py-2">{item.variant.sku}</td>
                   <td className="py-2 uppercase">{item.brand} {item.productName}</td>
                   <td className="py-2 text-right">{item.quantity}</td>
                   <td className="py-2 text-right">{Number(item.price).toFixed(2).replace('.', ',')}</td>
                   <td className="py-2 text-right">{(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}</td>
                 </tr>
               ))}
            </tbody>
         </table>

         {/* TOPLAMLAR */}
         <div className="flex justify-end text-[11px] font-bold">
            <div className="w-64 space-y-2">
               <div className="flex justify-between border-b border-black pb-1">
                 <span>Sayfa Toplamı :</span>
                 <span>{sayfaToplami.toFixed(2).replace('.', ',')}</span>
               </div>
               <div className="flex justify-between pt-1">
                 <span>TOPLAM :</span>
                 <span className="font-black">{sayfaToplami.toFixed(2).replace('.', ',')} USD</span>
               </div>
               <div className="flex justify-between">
                 <span>İNDİRİM :</span>
                 <span className="font-black">{indirimUSD.toFixed(2).replace('.', ',')} USD</span>
               </div>
               <div className="flex justify-between border-b border-red-600 pb-2 mb-2">
                 <span>ESKİ BAKİYE :</span>
                 <span className="font-black">{eskiBakiye.toFixed(2).replace('.', ',')} USD</span>
               </div>
               <div className="flex justify-between text-red-600 text-sm">
                 <span>TOPLAM :</span>
                 <span className="font-black">{genelToplam.toFixed(2).replace('.', ',')} USD</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
