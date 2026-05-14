"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { OrderRecord } from "./order-store";

type OrderHistoryContextType = {
  orders: OrderRecord[];
  addOrder: (order: OrderRecord) => void;
};

const OrderHistoryContext = createContext<OrderHistoryContextType | null>(null);

const STORAGE_KEY = "yildiz-store-order-history";

export function OrderHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch {
        setOrders([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
  };

  const value = useMemo(
    () => ({
      orders,
      addOrder,
    }),
    [orders],
  );

  return (
    <OrderHistoryContext.Provider value={value}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  const context = useContext(OrderHistoryContext);

  if (!context) {
    throw new Error("useOrderHistory must be used within OrderHistoryProvider");
  }

  return context;
}