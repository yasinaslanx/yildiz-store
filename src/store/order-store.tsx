"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
};

export type OrderPayment = {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  total: number;
  items: Array<{
    variantId: string;
    productName: string;
    brand: string;
    quantity: number;
    price: number;
    color: string;
    storage?: string;
    image: string;
  }>;
};

type OrderContextType = {
  lastOrder: OrderRecord | null;
  setLastOrder: (order: OrderRecord | null) => void;
};

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);

  const value = useMemo(
    () => ({
      lastOrder,
      setLastOrder,
    }),
    [lastOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }

  return context;
}