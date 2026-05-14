"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useUi();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({
        email: form.email,
        password: form.password
    });

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    router.push(redirect);
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-lg px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100 lg:p-16">
        <header className="text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Hoş Geldiniz</p>
           <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900">Giriş Yap</h1>
           <p className="mt-2 text-sm font-medium text-stone-500">Hesabınıza erişmek için bilgilerinizi girin.</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-posta Adresi</label>
            <input
              type="email"
              required
              placeholder="ornek@yildizstore.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
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
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between px-1">
             <label className="group flex cursor-pointer items-center gap-3">
                <div className="relative flex h-5 w-5 items-center justify-center rounded-md border-2 border-stone-200 transition group-hover:border-stone-400">
                   <input
                     type="checkbox"
                     className="peer absolute h-full w-full opacity-0"
                     checked={form.rememberMe}
                     onChange={(e) => setForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                   />
                   <div className="h-2 w-2 rounded-sm bg-black opacity-0 transition peer-checked:opacity-100" />
                </div>
                <span className="text-xs font-bold text-stone-500">Beni Hatırla</span>
             </label>

             <Link 
               href="/forgot-password" 
               className="text-xs font-black uppercase tracking-widest text-stone-400 underline underline-offset-4 transition hover:text-stone-900"
             >
               Şifremi Unuttum
             </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-full border-2 border-black bg-white py-5 text-sm font-black uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-100"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <footer className="mt-10 text-center">
           <p className="text-xs font-bold text-stone-400">
             Henüz bir hesabınız yok mu?{' '}
             <Link href="/register" className="font-black text-stone-900 underline underline-offset-4 transition hover:text-stone-600">
               Kayıt Ol
             </Link>
           </p>
        </footer>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}