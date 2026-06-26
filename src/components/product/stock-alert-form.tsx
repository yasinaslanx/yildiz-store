"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

export function StockAlertForm({ variantId }: { variantId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, variantId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.message || "Bir hata oluştu.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Sunucuya bağlanılamadı.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[3rem] bg-stone-50 p-12 text-center border border-stone-100 animate-in fade-in duration-500">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Tebrikler</p>
        <h3 className="mt-3 text-xl font-black uppercase tracking-tighter text-stone-900">Kayıt Olundu!</h3>
        <p className="mt-3 text-sm font-medium text-stone-400">
          Bu ürün stoğa girdiğinde <strong className="text-stone-900">{email}</strong> adresinize haber vereceğiz.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[3rem] bg-stone-50 p-10 border border-stone-100 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white border border-stone-100 shadow-sm">
          <Bell className="h-6 w-6 text-stone-900" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Stok Bildirimi</p>
        <h3 className="text-lg font-black uppercase tracking-tight text-stone-900">Bu Ürün Tükendi</h3>
        <p className="text-xs font-medium text-stone-400">
          E-postanızı bırakın, stoka girdiğinde anında haber verelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          className="w-full rounded-full border-2 border-stone-200 bg-white px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 transition-colors placeholder:text-stone-300"
        />
        {status === "error" && (
          <p className="text-center text-xs font-bold text-red-500">{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-stone-950 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Kaydediliyor..." : "Stoka Girince Haber Ver"}
        </button>
      </form>
    </div>
  );
}
