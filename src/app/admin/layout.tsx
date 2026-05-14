"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useEffect } from "react";

const adminMenu = [
  { href: "/admin", label: "Kontrol Paneli", icon: "📊" },
  { href: "/admin/orders", label: "Siparişler", icon: "📦" },
  { href: "/admin/products", label: "Ürün Yönetimi", icon: "📱" },
  { href: "/admin/warehouse", label: "Depo Yönetimi", icon: "🏠" },
  { href: "/admin/categories", label: "Kategori Yönetimi", icon: "📁" },
  { href: "/admin/stock-alerts", label: "Stok Bekleyenler", icon: "🔔" },
  { href: "/admin/support", label: "Canlı Destek", icon: "💬" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar / Sub-nav */}
      <aside className="w-full border-r border-stone-100 bg-white lg:w-72">
        <div className="sticky top-[73px] p-6 lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim</p>
          <h2 className="mt-2 text-2xl font-black text-stone-900 tracking-tighter">Panel</h2>
          
          <nav className="mt-10 space-y-2">
            {adminMenu.map((item) => {
              const isActive = pathname === item.href;
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
