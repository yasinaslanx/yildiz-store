"use client";

import { CreditCard } from "lucide-react";

type InstallmentTableProps = {
  price: number;
};

export function InstallmentTable({ price }: InstallmentTableProps) {
  const banks = [
    { name: "World", img: "https://www.worldcard.com.tr/Assets/img/logo.png" },
    { name: "Maximum", img: "https://www.maximum.com.tr/Assets/img/logo.png" },
    { name: "Bonus", img: "https://www.bonus.com.tr/Assets/img/logo.png" },
    { name: "Axess", img: "https://www.axess.com.tr/Assets/img/logo.png" },
  ];

  const installmentPlans = [
    { count: 3, label: "3 Taksit", rate: 1.05 },
    { count: 6, label: "6 Taksit", rate: 1.10 },
    { count: 9, label: "9 Taksit", rate: 1.15 },
    { count: 12, label: "12 Taksit", rate: 1.20 },
  ];

  return (
    <div className="w-full space-y-8 p-4">
      <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
        <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center">
          <CreditCard className="text-stone-900" />
        </div>
        <div>
          <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Taksit Seçenekleri</h3>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Kredi kartlarına uygun ödeme planları</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Taksit Sayısı</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Aylık Ödeme</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Toplam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            <tr className="group">
              <td className="py-6 text-xs font-black text-stone-900 uppercase italic">Tek Çekim</td>
              <td className="py-6 text-xs font-black text-stone-900 text-right italic">{price.toLocaleString()} ₺</td>
              <td className="py-6 text-xs font-black text-stone-900 text-right italic">{price.toLocaleString()} ₺</td>
            </tr>
            {installmentPlans.map((plan) => {
              const total = price * plan.rate;
              const monthly = total / plan.count;
              return (
                <tr key={plan.count} className="group hover:bg-stone-50 transition-colors">
                  <td className="py-6 text-xs font-bold text-stone-600 uppercase">{plan.label}</td>
                  <td className="py-6 text-xs font-black text-stone-900 text-right italic">{monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })} ₺</td>
                  <td className="py-6 text-xs font-black text-stone-900 text-right italic">{total.toLocaleString()} ₺</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.1em] leading-relaxed">
        * Taksit oranları bankalara göre değişiklik gösterebilir. Ödeme sayfasında kart bilgilerinizi girdiğinizde güncel oranlar gösterilecektir.
      </p>
    </div>
  );
}
