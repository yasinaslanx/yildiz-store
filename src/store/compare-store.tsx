"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export type CompareProduct = {
  id: string;         // variantId
  productId: string;
  productName: string;
  brand: string;
  slug: string;
  image: string;
  price: number;
  category?: string;
  color?: string;
  storage?: string;
};

type CompareContextType = {
  items: CompareProduct[];
  addToCompare: (item: CompareProduct) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextType | null>(null);
const COMPARE_STORAGE_KEY = "sunix-compare-items";
const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareProduct[]>([]);
  // items'ın anlık değerine setState dışında erişmek için ref kullan
  const itemsRef = useRef<CompareProduct[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (stored) {
      queueMicrotask(() => {
        try { setItems(JSON.parse(stored)); } catch { setItems([]); }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCompare = useCallback((item: CompareProduct) => {
    // Toast kararını setState DIŞINDA ver — render sırasında başka bileşen güncellemesi yasak
    const current = itemsRef.current;
    const alreadyIn = current.some(x => x.id === item.id);

    if (!alreadyIn && current.length >= MAX_COMPARE) {
      toast.error(`En fazla ${MAX_COMPARE} ürün karşılaştırabilirsiniz.`);
      return;
    }

    setItems(prev => {
      if (prev.some(x => x.id === item.id)) {
        return prev.filter(x => x.id !== item.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, item];
    });

    if (!alreadyIn) {
      toast.success("Karşılaştırmaya eklendi!");
    }
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setItems(prev => prev.filter(x => x.id !== id));
  }, []);

  const isInCompare = useCallback((id: string) => {
    return items.some(x => x.id === id);
  }, [items]);

  const clearCompare = useCallback(() => {
    setItems([]);
    localStorage.removeItem(COMPARE_STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    items, addToCompare, removeFromCompare, isInCompare, clearCompare
  }), [items, addToCompare, removeFromCompare, isInCompare, clearCompare]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within CompareProvider");
  return context;
}
