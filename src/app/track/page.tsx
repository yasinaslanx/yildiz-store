"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ExternalLink, ArrowRight } from "lucide-react";

const STATUS_STEPS = [
  { id: "PENDING",   label: "Sipariş Alındı", icon: Clock,        desc: "Talebiniz bize ulaştı." },
  { id: "CONFIRMED", label: "Onaylandı",      icon: CheckCircle2, desc: "Ödeme doğrulandı." },
  { id: "SHIPPED",   label: "Kargoda",        icon: Truck,        desc: "Paketiniz yola çıktı." },
  { id: "DELIVERED", label: "Teslim Edildi",  icon: MapPin,       desc: "Keyifli kullanımlar!" },
];

type TrackResult = {
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingCity: string;
  shippingDistrict: string;
  totalAmount: number;
  itemCount: number;
  items: {
    id: string;
    productName: string;
    brand: string;
    color: string;
    storage?: string | null;
    image?: string | null;
    price: number;
    quantity: number;
  }[];
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Sipariş Alındı",
    CONFIRMED: "Onaylandı / Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return labels[status] ?? status;
}

export default function TrackPage() {
  const [form, setForm] = useState({ orderNumber: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  const currentStep = result ? STATUS_STEPS.findIndex(s => s.id === result.status) : -1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: form.orderNumber.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || "Sipariş bulunamadı.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 shadow-2xl shadow-stone-900/20">
          <Truck className="h-9 w-9 text-white" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Kargo Takip</p>
        <h1 className="mt-3 text-5xl font-black tracking-tighter text-stone-900 uppercase">
          Siparişimi Takip Et
        </h1>
        <p className="mt-4 text-sm font-medium text-stone-400">
          Sipariş numaranız ve kayıtlı telefon numaranızla siparişinizi sorgulayın.
        </p>
      </div>

      {/* Search Form */}
      <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Sipariş Numarası
              </label>
              <input
                type="text"
                required
                placeholder="20240101123456"
                value={form.orderNumber}
                onChange={e => setForm(prev => ({ ...prev, orderNumber: e.target.value }))}
                className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Telefon Numarası
              </label>
              <input
                type="tel"
                required
                placeholder="05XX XXX XX XX"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-stone-950 py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.01] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4" />
            {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
            {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Timeline */}
          <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100">
            <div className="mb-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Sipariş Durumu</p>
                <h2 className="mt-2 text-2xl font-black tracking-tighter text-stone-900 uppercase">
                  #{result.orderNumber}
                </h2>
              </div>
              <div className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                result.status === "DELIVERED" ? "bg-green-50 text-green-700 border border-green-100" :
                result.status === "SHIPPED"   ? "bg-amber-50 text-amber-700 border border-amber-100" :
                result.status === "CANCELLED" ? "bg-red-50 text-red-700 border border-red-100" :
                "bg-stone-900 text-white"
              }`}>
                {statusLabel(result.status)}
              </div>
            </div>

            {result.status !== "CANCELLED" && (
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="relative flex flex-col items-center text-center">
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className="absolute left-[calc(50%+2rem)] top-8 hidden h-0.5 w-[calc(100%-4rem)] bg-stone-100 lg:block">
                          <div className="h-full bg-stone-900 transition-all duration-1000" style={{ width: idx < currentStep ? "100%" : "0%" }} />
                        </div>
                      )}
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-700 ${
                        isActive ? "border-stone-900 bg-stone-900 text-white shadow-xl shadow-stone-200" : "border-stone-100 bg-stone-50 text-stone-200"
                      } ${isCurrent ? "scale-110" : ""}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-stone-900" : "text-stone-300"}`}>
                          {step.label}
                        </p>
                        <p className="text-[9px] font-bold text-stone-400 uppercase leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tracking Info */}
          {(result.trackingNumber || result.shippingCarrier) && (
            <div className="rounded-[3rem] border border-amber-100 bg-amber-50 p-10">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Kargo Bilgisi</p>
                  {result.shippingCarrier && (
                    <p className="text-lg font-black text-stone-900">{result.shippingCarrier}</p>
                  )}
                  {result.trackingNumber && (
                    <p className="text-2xl font-black tracking-[0.1em] text-stone-900">{result.trackingNumber}</p>
                  )}
                </div>
                {result.trackingUrl && (
                  <a
                    href={result.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-full bg-stone-950 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <Truck className="h-4 w-4" />
                    Kargo Sitesinde Takip Et
                    <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="rounded-[3rem] border border-stone-100 bg-white p-10">
            <h3 className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
              Sipariş İçeriği ({result.itemCount} Ürün)
            </h3>
            <div className="space-y-6">
              {result.items.map(item => (
                <div key={item.id} className="flex items-center gap-6">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} fill className="object-contain p-2 mix-blend-multiply" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-200">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-stone-900 uppercase tracking-tight">{item.productName}</p>
                    <p className="mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {item.brand}{item.color ? ` · ${item.color}` : ""}{item.storage ? ` · ${item.storage}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-stone-900">{(item.price * item.quantity).toLocaleString("tr-TR")} ₺</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">{item.quantity} Adet</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Toplam Tutar</span>
              <span className="text-xl font-black tracking-tighter text-stone-900">{result.totalAmount.toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>

          {/* Help */}
          <div className="flex items-center justify-between rounded-[2rem] border border-stone-100 bg-stone-50 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-xl">💬</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-900">Sorunuz mu var?</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Müşteri hizmetlerimiz yardımcı olsun</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="rounded-full border-2 border-stone-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-900 hover:text-white transition-all"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
