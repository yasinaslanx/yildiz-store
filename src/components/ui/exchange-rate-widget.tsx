"use client";

import { useCurrency } from "@/store/currency-store";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ExchangeRateWidget() {
  const { rates, exchangeRates } = useCurrency();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopover]);

  if (!isMounted) return <div className="h-10 w-48 bg-stone-100 rounded-full animate-pulse" />;

  const usdRate = exchangeRates.USD;
  const displayRate = rates.USD.toFixed(2);
  const changePercent = usdRate?.change || 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="relative">
      {/* Main Exchange Rate Widget */}
      <div
        ref={buttonRef}
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center gap-4 rounded-full border border-stone-200/60 bg-white py-1.5 pl-4 pr-1.5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      >
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
              {displayRate}
            </span>
          </div>
        </div>
      </div>

      {/* Popover Dropdown */}
      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-2 right-0 bg-white border border-stone-200 rounded-lg shadow-lg p-4 z-50 w-80"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00a669] text-white">
                <span className="text-lg font-black">$</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase">Amerikan Doları</div>
                <div className="text-sm font-black text-stone-900">USD/TL</div>
              </div>
            </div>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-orange-500' : 'text-green-600'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className={`text-sm font-bold ${isPositive ? 'text-orange-500' : 'text-green-600'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-stone-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 font-semibold">Alış</span>
              <span className="text-sm font-bold text-stone-900">{usdRate?.buy.toFixed(4) || displayRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 font-semibold">Satış</span>
              <span className="text-sm font-bold text-orange-500">{usdRate?.sell.toFixed(4) || displayRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 font-semibold">Değişim</span>
              <span className={`text-sm font-bold ${isPositive ? 'text-orange-500' : 'text-green-600'}`}>
                {isPositive ? '📈' : '📉'} {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs text-stone-400 text-center">
            Son güncelleme: {usdRate?.lastUpdated ? new Date(usdRate.lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'yükleniyor...'}
          </div>
        </div>
      )}
    </div>
  );
}
