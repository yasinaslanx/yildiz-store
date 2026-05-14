"use client";

import { CartProvider } from "@/store/cart-store";
import { FavoritesProvider } from "@/store/favorites-store";
import { OrderProvider } from "@/store/order-store";
import { OrderHistoryProvider } from "@/store/order-history-store";
import { UiProvider } from "@/store/ui-store";
import { AuthProvider } from "@/store/auth-store";
import { ToastContainer } from "@/components/ui/toast-container";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <AuthProvider>
        <OrderHistoryProvider>
          <OrderProvider>
            <FavoritesProvider>
              <CartProvider>
                {children}
                <ToastContainer />
              </CartProvider>
            </FavoritesProvider>
          </OrderProvider>
        </OrderHistoryProvider>
      </AuthProvider>
    </UiProvider>
  );
}