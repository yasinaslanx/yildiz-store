"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";

function DealerLoginForm() {
  const router = useRouter();
  const { showToast } = useUi();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && (user?.role === "DEALER" || user?.role === "dealer")) {
      router.push("/bayi");
    }
  }, [user, isAuthenticated, router]);

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/dealer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.message, "error");
        setLoading(false);
        return;
      }
      
      // sync auth store (it fetches /api/auth/me)
      window.location.href = "/bayi";
    } catch (err) {
      showToast("Bir hata oluştu.", "error");
      setLoading(false);
      return;
    }

    // window.location handles redirection above
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-lg px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="rounded-[3rem] border border-blue-100 bg-white p-10 shadow-2xl shadow-blue-900/5 lg:p-16">
        <header className="text-center">
           <div className="mx-auto bg-blue-50 text-blue-600 px-4 py-2 rounded-full inline-block mb-4 border border-blue-100">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sunix Bayi Portalı</p>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-stone-900">Bayi Girişi</h1>
           <p className="mt-2 text-sm font-medium text-stone-500">Toptan fiyatlar ve size özel kampanyalar için giriş yapın.</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">İletişim Telefonu</label>
            <input
              type="tel"
              required
              placeholder="0 (5XX) XXX XX XX"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şifre</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-full border-2 border-blue-600 bg-blue-600 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-blue-700 hover:border-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-blue-600/20"
          >
            {loading ? "Giriş Yapılıyor..." : "Bayi Girişi Yap"}
          </button>
        </form>

        <footer className="mt-10 text-center pt-8 border-t border-stone-100">
           <p className="text-xs font-bold text-stone-400">
             Bayimiz değil misiniz?{' '}
             <Link href="/dealer-application" className="font-black text-blue-600 underline underline-offset-4 transition hover:text-blue-800">
               Hemen Başvurun
             </Link>
           </p>
        </footer>
      </div>
    </section>
  );
}

export default function DealerLoginPage() {
  return (
    <Suspense fallback={null}>
      <DealerLoginForm />
    </Suspense>
  );
}
