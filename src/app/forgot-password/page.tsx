"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { forgotPasswordRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      setLoading(true);

      const result = await forgotPasswordRequest(email);

      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İstek gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold text-stone-900 uppercase tracking-tighter">Şifremi Unuttum</h1>

        <p className="mt-2 text-sm text-stone-400 font-bold uppercase tracking-tight">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>

        {message && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 uppercase tracking-tight">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 uppercase tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-stone-400">E-posta</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-900 focus:border-stone-900 focus:bg-white outline-none transition"
              placeholder="ornek@mail.com"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 shadow-xl shadow-stone-100"
          >
            {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition underline underline-offset-4">
          Giriş sayfasına dön
        </Link>
      </section>
    </main>
  );
}
