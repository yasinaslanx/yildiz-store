"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addCartItemRequest,
  deleteCartItemRequest,
  fetchCart,
  updateCartItemRequest,
} from "@/lib/api";
import { useAuth } from "@/store/auth-store";
import toast from "react-hot-toast";

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  variantId: string;
  color: string;
  storage?: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  increaseItem: (id: string) => void;
  decreaseItem: (id: string) => void;
  clearCart: () => void;
  clearLocalState: () => void;
  itemCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "yildiz-store-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDbCart() {
      try {
        const dbItems = await fetchCart();
        setItems(dbItems);
      } catch (error) {
        console.error("Load DB Cart Error:", error);
      }
    }

    void loadDbCart();
  }, [user?.id]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    if (user?.id) {
      void addCartItemRequest({
        variantId: item.variantId,
        quantity: 1,
      })
        .then(async () => {
          const dbItems = await fetchCart();
          setItems(dbItems);
          toast.success("Ürün sepetinize eklendi.");
        })
        .catch((error) => {
          console.error("Add Item Error:", error);
          toast.error(error instanceof Error ? error.message : "Ürün sepete eklenirken hata oluştu.");
        });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((x) => x.variantId === item.variantId);

      if (existing) {
        return prev.map((x) =>
          x.variantId === item.variantId
            ? { ...x, quantity: x.quantity + 1 }
            : x,
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });

    toast.success("Ürün sepetinize eklendi.");
  };

  const removeItem = (id: string) => {
    if (user?.id) {
      void deleteCartItemRequest(id)
        .then(async () => {
          const dbItems = await fetchCart();
          setItems(dbItems);
          toast.success("Ürün sepetinizden kaldırıldı.");
        })
        .catch(async (error) => {
          console.error("Remove Item Error:", error);
          const dbItems = await fetchCart();
          setItems(dbItems);
          
          // Eğer hata "ürün bulunamadı" ise kullanıcı zaten silmiş demektir, hata gösterme
          if (error instanceof Error && (error.message.includes("bulunamadı") || error.message.includes("not found"))) {
            return;
          }
          
          toast.error(error instanceof Error ? error.message : "Ürün silinirken bir hata oluştu.");
        });
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Ürün sepetinizden kaldırıldı.");
  };

  const increaseItem = (id: string) => {
    if (user?.id) {
      const item = items.find((x) => x.id === id);
      if (item) {
        void updateCartItemRequest(id, item.quantity + 1)
          .then(async () => {
            const dbItems = await fetchCart();
            setItems(dbItems);
          })
          .catch(async (error) => {
            console.error("Increase Item Error:", error);
            const dbItems = await fetchCart();
            setItems(dbItems);
            toast.error(error instanceof Error ? error.message : "Miktar artırılamadı.");
          });
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseItem = (id: string) => {
    if (user?.id) {
      const item = items.find((x) => x.id === id);
      if (item && item.quantity > 1) {
        void updateCartItemRequest(id, item.quantity - 1)
          .then(async () => {
            const dbItems = await fetchCart();
            setItems(dbItems);
          })
          .catch(async (error) => {
            console.error("Decrease Item Error:", error);
            const dbItems = await fetchCart();
            setItems(dbItems);
            toast.error(error instanceof Error ? error.message : "Miktar azaltılamadı.");
          });
      } else if (item && item.quantity === 1) {
        removeItem(id);
      }
      return;
    }

    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setItems([]);

  const clearLocalState = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseItem,
        decreaseItem,
        clearCart,
        clearLocalState,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
