"use client";

import { useEffect, useState, useRef } from "react";
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
  id: string;
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
    dealerTransactions: { type: string, amount: number, orderId?: string }[]
  }
};

export default function PosPrintPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const hasPrinted = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/pos/order/${params.orderId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setOrder(data.order);
          // Wait a bit for images to load, then trigger print
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
    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [params.orderId]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!order) return <div className="p-10 text-center">Sipariş bulunamadı.</div>;

  // Hesaplamalar (USD)
  const sayfaToplami = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const indirimUSD = Number(order.discountAmount);
  const toplamUSD = sayfaToplami - indirimUSD;

  // Eski Bakiye Hesaplama
  let eskiBakiye = 0;
  let suanOdenen = 0;

  if (order.user && order.user.dealerTransactions) {
    const orderDate = new Date(order.createdAt).getTime();

    order.user.dealerTransactions.forEach((t: any) => {
      const txDate = new Date(t.createdAt).getTime();

      // Bu siparişin "DEBT" (Borç) kaydı ise (Siparişi faturaya eklerken oluşturulan borç):
      // Bunu ne eski bakiyeye ne de ödenene katmıyoruz, çünkü o faturanın kendisidir.
      if (t.orderId === order.id && t.type === "DEBT") {
        return; 
      }

      // Siparişten ÖNCE olan tüm işlemler ESKİ BORÇ'a dahil edilir.
      if (txDate < orderDate) {
        if (t.type === "DEBT") eskiBakiye += Number(t.amount);
        if (t.type === "PAYMENT") eskiBakiye -= Number(t.amount);
      } 
      // Sipariş anında VEYA SONRASINDA yapılan her türlü ödeme (PAYMENT) "Alınan Tahsilat" olarak gösterilir.
      else if (txDate >= orderDate) {
        if (t.type === "PAYMENT") suanOdenen += Number(t.amount);
      }
    });
  }

  const kalanBakiye = eskiBakiye + toplamUSD - suanOdenen;

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
                 {/* CSS Instagram gradient circle */}
                 <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center p-[2px]">
                   <div className="w-full h-full border-[1.5px] border-white rounded-[4px]"></div>
                 </div>
                 <span className="text-xs font-bold">sunixstore</span>
               </div>
            </div>
         </div>

         {/* SİPARİŞ FİŞİ TİTLE */}
         <div className="border-t-[1.5px] border-[#cc0000] my-8 relative flex justify-center">
            <div className="absolute -top-[10px] bg-white px-6 text-[#cc0000] font-black tracking-wide">
               SİPARİŞ FİŞİ
            </div>
         </div>

         {/* MÜŞTERİ BİLGİLERİ */}
         <div className="flex justify-between text-[11px] font-bold mb-8">
            <table className="w-[350px]">
              <tbody>
                <tr>
                  <td className="w-20 uppercase pb-1">SAYIN</td>
                  <td className="w-4 pb-1">:</td>
                  <td className="text-blue-700 uppercase pb-1">{order.customerName}</td>
                </tr>
                <tr>
                  <td className="uppercase pb-1">CEP TEL</td>
                  <td className="pb-1">:</td>
                  <td className="text-blue-700 pb-1">{order.customerPhone || "-"}</td>
                </tr>
                <tr>
                  <td className="uppercase pb-1">ADRES</td>
                  <td className="pb-1">:</td>
                  <td className="pb-1">{order.shippingAddress || "-"}</td>
                </tr>
              </tbody>
            </table>
            
            <table className="w-[200px]">
              <tbody>
                <tr>
                  <td className="w-20 text-right pb-1">Fiş Tarihi</td>
                  <td className="w-4 text-center pb-1">:</td>
                  <td className="text-right pb-1">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
                <tr>
                  <td className="text-right pb-1">Fiş No</td>
                  <td className="text-center pb-1">:</td>
                  <td className="text-right pb-1">{order.orderNumber.replace('POS-', '')}</td>
                </tr>
              </tbody>
            </table>
         </div>

         {/* TABLO */}
         <table className="w-full text-[11px] font-bold mb-8 border-collapse">
            <thead>
               <tr className="text-[#cc0000]">
                 <th className="py-2 text-left border-b-[1.5px] border-[#cc0000]">Barkod</th>
                 <th className="py-2 text-left border-b-[1.5px] border-[#cc0000]">Stok Adı</th>
                 <th className="py-2 text-center border-b-[1.5px] border-[#cc0000]">Miktar</th>
                 <th className="py-2 text-center border-b-[1.5px] border-[#cc0000]">Birim</th>
                 <th className="py-2 text-center border-b-[1.5px] border-[#cc0000]">TUTAR USD $</th>
               </tr>
            </thead>
            <tbody>
               {order.items.map((item, i) => (
                 <tr key={item.id} className={i % 2 === 1 ? 'bg-[#e0e7ff]' : ''}>
                   <td className="py-2.5 px-1">{item.variant.sku}</td>
                   <td className="py-2.5 px-1 uppercase">{item.brand} {item.productName}</td>
                   <td className="py-2.5 px-1 text-center">{item.quantity}</td>
                   <td className="py-2.5 px-1 text-center">{Number(item.price).toFixed(2).replace('.', ',')}</td>
                   <td className="py-2.5 px-1 text-center">{(Number(item.price) * item.quantity).toFixed(2).replace('.', ',')}</td>
                 </tr>
               ))}
            </tbody>
         </table>

         {/* TOPLAMLAR */}
         <div className="flex justify-end text-[11px] font-bold">
            <table className="w-[250px]">
               <tbody>
                  <tr>
                    <td className="text-right py-1">Sayfa Toplamı</td>
                    <td className="text-center w-6 py-1">:</td>
                    <td className="text-right py-1">{sayfaToplami.toFixed(2).replace('.', ',')}</td>
                  </tr>
                  <tr>
                    <td className="text-right py-1">TOPLAM</td>
                    <td className="text-center py-1">:</td>
                    <td className="text-right py-1">{sayfaToplami.toFixed(2).replace('.', ',')} USD</td>
                  </tr>
                  <tr>
                    <td className="text-right py-1">İNDİRİM</td>
                    <td className="text-center py-1">:</td>
                    <td className="text-right py-1">{indirimUSD.toFixed(2).replace('.', ',')} USD</td>
                  </tr>
                  {suanOdenen > 0 && (
                    <tr>
                      <td className="text-right py-1">ÖDENEN TAHSİLAT</td>
                      <td className="text-center py-1">:</td>
                      <td className="text-right py-1 text-green-700">-{suanOdenen.toFixed(2).replace('.', ',')} USD</td>
                    </tr>
                  )}
                  {eskiBakiye !== 0 && (
                    <tr>
                      <td className="text-right py-1">
                        {eskiBakiye < 0 ? 'ÖNCEDEN ÖDENEN' : 'ESKİ BORÇ'}
                      </td>
                      <td className="text-center py-1">:</td>
                      <td className="text-right py-1">{eskiBakiye < 0 ? '-' : ''}{Math.abs(eskiBakiye).toFixed(2).replace('.', ',')} USD</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-1">
                      <div className="w-full border-b-[1.5px] border-[#cc0000]"></div>
                    </td>
                  </tr>
                  <tr className="text-[#cc0000]">
                    <td className="text-right py-2">KALAN BAKİYE</td>
                    <td className="text-center py-2">:</td>
                    <td className="text-right py-2 font-black">{kalanBakiye.toFixed(2).replace('.', ',')} USD</td>
                  </tr>
               </tbody>
            </table>
         </div>

      </div>
    </div>
  );
}
