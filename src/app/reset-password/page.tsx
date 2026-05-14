"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordRequest } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Şifre sıfırlama tokenı eksik.");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (password !== passwordAgain) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPasswordRequest({
        token,
        password,
      });

      setSuccess(result.message);
      setPassword("");
      setPasswordAgain("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Yeni Şifre Belirle</h1>

        <p className="mt-2 text-sm text-stone-400 font-bold uppercase tracking-tight">
          Hesabınız için yeni şifrenizi girin.
        </p>

        {success && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 uppercase tracking-tight">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 uppercase tracking-tight">
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-stone-400">Yeni Şifre</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-900 focus:border-stone-900 focus:bg-white outline-none transition"
                placeholder="En az 8 karakter"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-stone-400">Yeni Şifre Tekrar</label>
              <input
                value={passwordAgain}
                onChange={(event) => setPasswordAgain(event.target.value)}
                type="password"
                required
                className="w-full rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-900 focus:border-stone-900 focus:bg-white outline-none transition"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-stone-900 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 shadow-xl shadow-stone-100"
            >
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 block text-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition underline underline-offset-4">
          Giriş sayfasına dön
        </Link>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
