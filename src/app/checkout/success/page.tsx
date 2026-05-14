"use client";

import Link from "next/link";
import { useOrder } from "@/store/order-store";

export default function CheckoutSuccessPage() {
  const { lastOrder } = useOrder();

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-green-700">
          Sipariş Başarılı
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-950">
          Siparişiniz alındı
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-600">
          Siparişiniz başarıyla oluşturuldu. Bu alanı ileride gerçek ödeme ve sipariş
          doğrulama altyapısına bağlayacağız.
        </p>

        {lastOrder && (
          <div className="mx-auto mt-10 max-w-2xl rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6 text-left">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-stone-500">Sipariş No</p>
                <p className="text-lg font-semibold text-stone-950">
                  {lastOrder.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-stone-500">Toplam</p>
                <p className="text-lg font-semibold text-stone-950">
                  {lastOrder.total.toLocaleString("tr-TR")}₺
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-stone-200 pt-6">
              <p className="text-sm text-stone-500">Teslimat</p>
              <p className="mt-1 text-base text-stone-900">
                {lastOrder.customer.firstName} {lastOrder.customer.lastName}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {lastOrder.customer.address}, {lastOrder.customer.district},{" "}
                {lastOrder.customer.city}
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-6 py-3 text-stone-800"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/phones"
            className="rounded-full bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </section>
  );
}