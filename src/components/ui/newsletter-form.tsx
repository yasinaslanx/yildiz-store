"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface NewsletterFormProps {
  variant?: "footer" | "bold";
}

export function NewsletterForm({ variant = "footer" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.debug ? `Hata: ${data.debug}` : data.message);
      }
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "bold") {
    return (
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-6">
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className="flex-1 rounded-full border-2 border-stone-200 bg-stone-50 px-8 py-6 text-sm font-black text-stone-900 outline-none focus:border-black focus:bg-white transition shadow-inner"
        />
        <button 
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-full border-2 border-black bg-white px-12 py-6 text-xs font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition active:scale-95 shadow-xl shadow-stone-100 disabled:opacity-50"
        >
          {loading ? "..." : "Abone Ol"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2">
      <input 
        type="email" 
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz" 
        className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all"
      />
      <button 
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-xl border-2 border-black bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-stone-900 hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "..." : "Katıl"}
      </button>
    </form>
  );
}
