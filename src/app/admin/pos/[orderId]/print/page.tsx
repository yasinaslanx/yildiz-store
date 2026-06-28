"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SunixLogo } from "@/components/layout/sunix-logo";
import QRCode from "qrcode";

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
    dealerTransactions: { type: string, amount: number, orderId?: string, createdAt: string }[]
  }
};

export default function PosPrintPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const hasPrinted = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/pos/order/${params.orderId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setOrder(data.order);

          // QR Kod üret
          const docUrl = `${window.location.origin}/admin/pos/${params.orderId}/print`;
          const qr = await QRCode.toDataURL(docUrl, { width: 80, margin: 1 });
          if (isMounted) setQrDataUrl(qr);

          // Wait a bit for images to load, then trigger print
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

  // WhatsApp paylaşım linki
  const docUrl = typeof window !== "undefined" ? `${window.location.origin}/admin/pos/${params.orderId}/print` : "";
  const whatsappPhone = order.customerPhone?.replace(/\D/g, "") || "";
  const whatsappMsg = encodeURIComponent(
    `Sayın ${order.customerName}, ${order.orderNumber} numaralı sipariş fişinizi aşağıdaki linkten görüntüleyebilirsiniz:\n${docUrl}`
  );
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/90${whatsappPhone}?text=${whatsappMsg}`
    : `https://wa.me/?text=${whatsappMsg}`;

  return (
    <div className="bg-white min-h-screen text-black font-sans print-page" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
      
      {/* Özel Print CSS'i */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print-page { padding: 20px; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
        @media screen {
          .no-print { display: flex; }
        }
      `}} />

      {/* WhatsApp Butonu - Sadece Ekranda Görünür */}
      <div className="no-print fixed top-4 right-4 z-50 gap-2 items-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-[#1ebe5d] transition"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp ile Gönder
        </a>
      </div>

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

         {/* İMZA & KAŞE ALANI */}
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

         {/* QR KOD + BELGE DOĞRULAMA */}
         {qrDataUrl && (
           <div className="mt-10 flex justify-between items-end">
             <p className="text-[9px] text-stone-400 max-w-[300px] leading-relaxed">
               Bu belge Sunix Mağaza Merkez tarafından düzenlenmiştir. Belge içeriğini doğrulamak için QR kodu okutunuz.
             </p>
             <div className="flex flex-col items-center gap-1">
               <img src={qrDataUrl} alt="Belge QR Kodu" className="w-20 h-20" />
               <span className="text-[8px] text-stone-400 uppercase tracking-widest">Belge Doğrulama</span>
             </div>
           </div>
         )}

      </div>
    </div>
  );
}
