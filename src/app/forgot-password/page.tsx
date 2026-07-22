"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useUi } from "@/store/ui-store";

export default function ForgotPasswordPage() {
  const { showToast } = useUi();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Lütfen e-posta adresinizi girin.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || "Şifre sıfırlama bağlantısı gönderildi.", "success");
        setSubmitted(true);
      } else {
        showToast(data.message || "Bir hata oluştu.", "error");
      }
    } catch {
      showToast("Bağlantı hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100 lg:p-16">
        <header className="text-center relative px-8">
          <Link
            href="/login"
            className="absolute left-0 top-0.5 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Şifre Sıfırlama</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900">Şifremi Unuttum</h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            {submitted
              ? "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
              : "Hesabınıza bağlı e-posta adresini girin, size şifre yenileme bağlantısı gönderelim."}
          </p>
        </header>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-posta Adresi</label>
              <input
                type="email"
                required
                placeholder="ornek@sunixstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-850 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-200"
            >
              {loading ? "Bağlantı Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </form>
        ) : (
          <div className="mt-12 text-center">
            <div className="rounded-2xl bg-stone-50 p-6 border border-stone-100 text-stone-600 text-sm font-medium">
              E-posta kutunuzu kontrol edin. Gelen bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz.
            </div>
            <Link
              href="/login"
              className="mt-8 inline-block cursor-pointer rounded-full border-2 border-black bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50"
            >
              Giriş Ekranına Dön
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
