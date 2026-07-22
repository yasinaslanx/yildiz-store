"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useEffect } from "react";

const adminMenu = [
  { href: "/admin", label: "Kontrol Paneli", icon: "📊" },
  { href: "/admin/pos", label: "Hızlı Satış (POS)", icon: "🛒" },
  { href: "/admin/pos/invoices", label: "Faturalar", icon: "🧾" },
  { href: "/admin/orders", label: "Siparişler", icon: "📦" },
  { href: "/admin/returns", label: "İade & Değişim", icon: "↩️" },
  { href: "/admin/ledger", label: "Cari Hesaplar", icon: "📓" },
  { href: "/admin/products", label: "Ürün Yönetimi", icon: "📱" },
  { href: "/admin/customer-offers", label: "Müşteri Teklifleri", icon: "🏷️" },
  { href: "/admin/warehouse", label: "Depo Yönetimi", icon: "🏠" },
  { href: "/admin/categories", label: "Kategori Yönetimi", icon: "📁" },
  { href: "/admin/coupons", label: "Kuponlar", icon: "🎟️" },
  { href: "/admin/bundles", label: "Bundle Kampanyaları", icon: "🎁" },
  { href: "/admin/stock-alerts", label: "Stok Bekleyenler", icon: "🔔" },
  { href: "/admin/support", label: "Canlı Destek", icon: "💬" },
  { href: "/admin/dealers", label: "Bayi Yönetimi", icon: "🤝" },
  { href: "/admin/users", label: "Kullanıcı Yönetimi", icon: "👥" },
  { href: "/admin/quotes", label: "İndirim Talepleri", icon: "💰" },
  { href: "/admin/product-requests", label: "Ürün Talepleri", icon: "📦" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar / Sub-nav */}
      <aside className="w-full border-r border-stone-100 bg-white lg:w-72 print:hidden">
        <div className="sticky top-[73px] p-6 lg:p-8 h-[calc(100vh-73px)] overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim</p>
          <h2 className="mt-2 text-2xl font-black text-stone-900 tracking-tighter">Panel</h2>
          
          <nav className="mt-10 space-y-2">
            {adminMenu.filter(item => {
              // Super admin her şeyi görür
              const isSuperAdmin =
                user?.email?.toLowerCase() === "aslanyasin@gmail.com" ||
                user?.email?.toLowerCase() === "aslanyasin320@gmail.com" ||
                user?.email?.toLowerCase() === "admin@sunixstore.com";
              if (isSuperAdmin) return true;
              
              // Herkese açık olan ana sayfa
              if (item.href === "/admin") return true;

              // İzin kontrolleri
              const p = user?.permissions || [];
              if (item.href === "/admin/orders" || item.href === "/admin/returns" || item.href === "/admin/quotes" || item.href === "/admin/pos" || item.href === "/admin/pos/invoices") return p.includes("ORDERS");
              if (item.href === "/admin/products" || item.href === "/admin/categories" || item.href === "/admin/stock-alerts" || item.href === "/admin/customer-offers" || item.href === "/admin/product-requests") return p.includes("PRODUCTS");
              if (item.href === "/admin/dealers" || item.href === "/admin/users" || item.href === "/admin/ledger") return p.includes("USERS");
              if (item.href === "/admin/support") return p.includes("SUPPORT");
              if (item.href === "/admin/coupons" || item.href === "/admin/bundles") return p.includes("MARKETING");
              if (item.href === "/admin/warehouse") return p.includes("WAREHOUSE");

              return false;
            }).map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : item.href === "/admin/pos"
                  ? pathname === "/admin/pos"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-stone-50 text-stone-900 shadow-sm"
                      : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-20 rounded-3xl bg-stone-50 p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Destek</p>
            <p className="mt-2 text-xs font-medium text-stone-500 leading-relaxed">
              Panel ile ilgili bir sorun mu yaşıyorsunuz? Teknik ekibe ulaşın.
            </p>
            <button className="mt-4 text-xs font-bold text-stone-900 underline underline-offset-4">
              Destek Talebi Aç
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 bg-stone-50/30">
        {children}
      </div>
    </div>
  );
}
