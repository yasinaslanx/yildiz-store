"use client";

import { useCurrency, Currency } from "@/store/currency-store";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: "TRY", symbol: "₺", label: "TL" },
    { code: "USD", symbol: "$", label: "USD" },
    { code: "EUR", symbol: "€", label: "EUR" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[9px] font-black text-stone-400 hover:text-stone-900 transition uppercase tracking-[0.2em]"
      >
        <span>{currency}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-24 bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden z-50"
          >
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  currency === c.code 
                    ? "bg-stone-50 text-stone-900" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <span>{c.code}</span>
                <span className="text-stone-400">{c.symbol}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
