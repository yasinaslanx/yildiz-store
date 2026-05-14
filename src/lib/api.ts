import type { Product, ProductCategory } from "@/data/products";
import type { OrderRecord } from "@/store/order-store";
import type { CartItem } from "@/store/cart-store";
import type { FavoriteItem } from "@/store/favorites-store";

export type ProductQueryParams = {
  q?: string;
  category?: string;
  brand?: string;
  featured?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export async function fetchProducts(params: ProductQueryParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);
  if (params.brand) searchParams.set("brand", params.brand);
  if (params.featured) searchParams.set("featured", "true");
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();

  const response = await fetch(`/api/products${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürünler alınamadı");
  }

  return result;
}

export async function fetchCategories() {
  const response = await fetch("/api/categories", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Kategoriler alınamadı");
  }

  return result.data;
}

export async function fetchProductDetail(slug: string) {
  const response = await fetch(`/api/products/${slug}`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürün detayı alınamadı");
  }

  return result.data;
}

export type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string;
  paymentMethod?: "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "CREDIT_CARD";
};

export async function createOrderRequest(payload: CheckoutPayload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Sunucu hatası (JSON bekleniyordu):", text);
    throw new Error("Sunucudan geçersiz bir yanıt geldi. Lütfen destek ekibiyle iletişime geçin.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sipariş oluşturulamadı");
  }

  return result.data;
}

export async function fetchOrders() {
  const response = await fetch("/api/orders", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Siparişler alınamadı");
  }

  return result.data;
}

export async function fetchOrderDetail(orderId: string) {
  const response = await fetch(`/api/orders/${orderId}`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sipariş detayı alınamadı");
  }

  return result.data;
}

export async function fetchCart(): Promise<CartItem[]> {
  const response = await fetch("/api/cart", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sepet alınamadı");
  }

  return result.data;
}

export async function addCartItemRequest(payload: {
  variantId: string;
  quantity?: number;
}) {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sepete eklenemedi");
  }

  return result;
}

export async function updateCartItemRequest(itemId: string, quantity: number) {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sepet güncellenemedi");
  }

  return result;
}

export async function deleteCartItemRequest(itemId: string) {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürün sepetten silinemedi");
  }

  return result;
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  const response = await fetch("/api/favorites", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Favoriler alınamadı");
  }

  return result.data;
}

export async function toggleFavoriteRequest(payload: {
  variantId: string;
}) {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Favori güncellenemedi");
  }

  return result.data as { active: boolean };
}

export async function fetchAdminOrders() {
  const response = await fetch("/api/admin/orders", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Admin siparişleri alınamadı");
  }

  return result.data;
}

export async function updateAdminOrderRequest(
  orderId: string,
  payload: {
    status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  },
) {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Sipariş güncellenemedi");
  }

  return result.data;
}

export async function fetchAdminProducts() {
  const response = await fetch("/api/admin/products", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürünler alınamadı");
  }

  return result.data;
}

export async function createAdminProductRequest(payload: {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  mainImage: string;
  variants: {
    sku: string;
    color: string;
    storage?: string | null;
    price: number;
    stock: number;
  }[];
}) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürün oluşturulamadı");
  }

  return result.data;
}

export async function updateAdminProductRequest(
  productId: string,
  payload: {
    name?: string;
    description?: string;
    brand?: string;
    active?: boolean;
    categoryId?: string;
    mainImage?: string;
  },
) {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ürün güncellenemedi");
  }

  return result.data;
}

export async function updateAdminVariantRequest(
  variantId: string,
  payload: {
    price?: number;
    oldPrice?: number | null;
    stock?: number;
    active?: boolean;
    sku?: string;
    image?: string;
  },
) {
  const response = await fetch(`/api/admin/variants/${variantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Varyant güncellenemedi");
  }

  return result.data;
}

export async function fetchAdminCategories() {
  const res = await fetch("/api/admin/categories", {
    cache: "no-store",
  });

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message || "Kategoriler alınamadı");
  }

  return result.data;
}

export async function createAdminCategory(payload: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message || "Kategori oluşturulamadı");
  }

  return result.data;
}

export async function updateAdminCategory(
  id: string,
  payload: {
    name?: string;
    description?: string;
    image?: string;
    active?: boolean;
  },
) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.message || "Kategori güncellenemedi");
  }

  return result.data;
}

export async function startIyzicoPaymentRequest(orderId: string) {
  const response = await fetch("/api/payments/iyzico/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Ödeme API hatası (JSON bekleniyordu):", text);
    throw new Error("Ödeme sistemi şu an yanıt vermiyor. Lütfen daha sonra tekrar deneyin.");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Ödeme başlatılamadı");
  }

  return result.data as {
    paymentPageUrl: string;
    token: string;
  };
}

export async function fetchAdminDashboard() {
  const response = await fetch("/api/admin/dashboard", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Dashboard verileri alınamadı");
  }

  return result.data;
}

export async function forgotPasswordRequest(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (!result.success) {
    const errorMessage = result.debug 
      ? `${result.message} (${result.debug})` 
      : (result.message || "Şifre sıfırlama isteği gönderilemedi");
    throw new Error(errorMessage);
  }

  return result;
}

export async function resetPasswordRequest(payload: {
  token: string;
  password: string;
}) {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Şifre güncellenemedi");
  }

  return result;
}
