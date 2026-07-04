"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Currency = "TRY" | "USD" | "EUR";

type CurrencyRates = {
  [key in Currency]: number;
};

type ExchangeRateDetail = {
  buy: number;
  sell: number;
  change: number;
  lastUpdated: Date;
};

type ExchangeRates = {
  USD?: ExchangeRateDetail;
  EUR?: ExchangeRateDetail;
};

// Sabit kur değerleri (İstenirse daha sonra TCMB API gibi bir servisten dinamik çekilebilir)
const DEFAULT_RATES: CurrencyRates = {
  TRY: 1,
  USD: 46.76,
  EUR: 50.5,
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
  exchangeRates: ExchangeRates;
  formatPrice: (amountInTry: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const CURRENCY_STORAGE_KEY = "sunix-store-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("TRY");
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    if (stored && ["TRY", "USD", "EUR"].includes(stored)) {
      setCurrencyState(stored);
    }

    // Fetch live rates
    const fetchRates = async () => {
      try {
        const response = await fetch("https://finans.truncgil.com/today.json");
        const data = await response.json();
        
        const newRates: ExchangeRates = {};
        
        if (data.USD && data.USD.Satış) {
          const usdSell = parseFloat(data.USD.Satış.replace(",", "."));
          const usdBuy = data.USD.Alış ? parseFloat(data.USD.Alış.replace(",", ".")) : usdSell;
          const usdChange = data.USD.Değişim ? parseFloat(data.USD.Değişim.replace(",", ".")) : 0;
          
          if (!isNaN(usdSell) && usdSell > 0) {
            setRates((prev) => ({ ...prev, USD: usdSell }));
            newRates.USD = {
              buy: usdBuy,
              sell: usdSell,
              change: usdChange,
              lastUpdated: new Date(),
            };
          }
        }
        
        if (data.EUR && data.EUR.Satış) {
          const eurSell = parseFloat(data.EUR.Satış.replace(",", "."));
          const eurBuy = data.EUR.Alış ? parseFloat(data.EUR.Alış.replace(",", ".")) : eurSell;
          const eurChange = data.EUR.Değişim ? parseFloat(data.EUR.Değişim.replace(",", ".")) : 0;
          
          if (!isNaN(eurSell) && eurSell > 0) {
            setRates((prev) => ({ ...prev, EUR: eurSell }));
            newRates.EUR = {
              buy: eurBuy,
              sell: eurSell,
              change: eurChange,
              lastUpdated: new Date(),
            };
          }
        }
        
        setExchangeRates(newRates);
      } catch (error) {
        console.error("Döviz kurları alınamadı:", error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
    // Her 5 dakikada bir güncelle
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, exchangeRates, formatPrice }}>
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
