"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchFavorites, toggleFavoriteRequest } from "@/lib/api";
import { useAuth } from "@/store/auth-store";

export type FavoriteItem = {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  slug: string;
  image: string;
  price: number;
};

type FavoritesContextType = {
  items: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  clearLocalState: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const FAVORITES_STORAGE_KEY = "yildiz-store-favorites";

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);

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
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDbFavorites() {
      try {
        const dbItems = await fetchFavorites();
        setItems(dbItems);
      } catch (error) {
        console.error("Load DB Favorites Error:", error);
      }
    }

    void loadDbFavorites();
  }, [user?.id]);

  const toggleFavorite = (item: FavoriteItem) => {
    if (user?.id) {
      void toggleFavoriteRequest({
        variantId: item.id,
      })
        .then(async () => {
          const dbItems = await fetchFavorites();
          setItems(dbItems);
        })
        .catch(async (error) => {
          console.error("Toggle Favorite Error:", error);
          const dbItems = await fetchFavorites();
          setItems(dbItems);
        });
      return;
    }

    setItems((prev) => {
      const exists = prev.some((x) => x.id === item.id);

      if (exists) {
        return prev.filter((x) => x.id !== item.id);
      }

      return [item, ...prev];
    });
  };

  const isFavorite = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const clearLocalState = () => {
    setItems([]);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      items,
      toggleFavorite,
      isFavorite,
      clearLocalState,
    }),
    [items],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
