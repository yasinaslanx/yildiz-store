"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-12 flex justify-center">
        <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center">
           <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </div>
      </div>

      <h1 className="text-5xl font-black tracking-tighter text-stone-900 uppercase">Ödeme Başarısız</h1>

      <p className="mt-6 text-lg text-stone-500 font-medium leading-relaxed">
        Ödeme işlemi tamamlanamadı. 
        {reason === "missing-token" && " Güvenlik doğrulaması başarısız oldu."}
        {reason === "missing-order" && " Sipariş bilgisi bulunamadı."}
        {reason === "server-error" && " Sistemsel bir hata oluştu."}
        {!reason && " Tekrar deneyebilir veya farklı bir ödeme yöntemi seçebilirsiniz."}
      </p>

      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
        {orderId ? (
          <Link
            href={`/orders/${orderId}`}
            className="rounded-full bg-black px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200"
          >
            Siparişi Gör
          </Link>
        ) : (
          <Link
            href="/checkout"
            className="rounded-full bg-black px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-stone-200"
          >
            Ödeme Sayfasına Dön
          </Link>
        )}

        <Link 
          href="/products" 
          className="rounded-full border-2 border-stone-100 bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-stone-900 transition-all hover:bg-stone-50 hover:border-stone-200"
        >
          Ürünlere Göz At
        </Link>
      </div>
    </main>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-black uppercase tracking-widest text-stone-300">Yükleniyor...</div>}>
      <FailContent />
    </Suspense>
  );
}
