"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Currency = "TRY" | "USD" | "EUR";

type CurrencyRates = {
  [key in Currency]: number;
};

// Sabit kur değerleri (İstenirse daha sonra TCMB API gibi bir servisten dinamik çekilebilir)
const DEFAULT_RATES: CurrencyRates = {
  TRY: 1,
  USD: 32.5,
  EUR: 35.1,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: CurrencyRates;
  formatPrice: (amountInTry: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const CURRENCY_STORAGE_KEY = "sunix-store-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("TRY");
  const [rates] = useState<CurrencyRates>(DEFAULT_RATES);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    if (stored && ["TRY", "USD", "EUR"].includes(stored)) {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  };

  const formatPrice = (amountInTry: number) => {
    const converted = amountInTry / rates[currency];
    
    return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "TRY" ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
