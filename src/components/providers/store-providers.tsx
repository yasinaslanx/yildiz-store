"use client";

import { CartProvider } from "@/store/cart-store";
import { FavoritesProvider } from "@/store/favorites-store";
import { CompareProvider } from "@/store/compare-store";
import { OrderProvider } from "@/store/order-store";
import { OrderHistoryProvider } from "@/store/order-history-store";
import { UiProvider } from "@/store/ui-store";
import { AuthProvider } from "@/store/auth-store";
import { CurrencyProvider } from "@/store/currency-store";
import { ToastContainer } from "@/components/ui/toast-container";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <AuthProvider>
        <OrderHistoryProvider>
          <OrderProvider>
            <CurrencyProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <CartProvider>
                    {children}
                    <ToastContainer />
                  </CartProvider>
                </CompareProvider>
              </FavoritesProvider>
            </CurrencyProvider>
          </OrderProvider>
        </OrderHistoryProvider>
      </AuthProvider>
    </UiProvider>
  );
}