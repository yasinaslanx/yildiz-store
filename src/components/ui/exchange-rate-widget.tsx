"use client";

import { useCurrency } from "@/store/currency-store";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function ExchangeRateWidget() {
  const { rates } = useCurrency();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateDateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return <div className="h-10 w-48 bg-stone-100 rounded-full animate-pulse" />;

  return (
    <div className="flex items-center gap-4 rounded-full border border-stone-200/60 bg-white py-1.5 pl-4 pr-1.5 shadow-sm">
      {/* Date / Time */}
      <div className="flex items-center gap-2 pr-4">
        <Clock className="h-4 w-4 text-blue-800" strokeWidth={2.5} />
        <div className="flex flex-col items-start leading-none gap-0.5">
           <span className="text-[13px] font-black text-stone-900 tracking-tight">{timeStr}</span>
           <span className="text-[10px] font-bold text-stone-500">{dateStr}</span>
        </div>
      </div>

      {/* Exchange Rate Pill */}
      <div className="flex items-center gap-2 rounded-full bg-white pr-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00a669] text-white">
          <span className="text-base font-black leading-none">$</span>
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
           <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">USD/TL</span>
           <span className="text-[13px] font-black tracking-tight text-stone-900">
             {rates.USD.toFixed(4)}
           </span>
        </div>
      </div>
    </div>
  );
}
