"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, ToggleLeft, ToggleRight, Package, Zap, X, Check } from "lucide-react";

type ProductOption = {
  id: string;
  name: string;
  brand: string;
  image?: string;
  price?: number;
};

type BundleDeal = {
  id: string;
  name: string;
  discountPercent: number;
  active: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  triggerProduct: ProductOption & { images: { url: string }[]; variants: { price: number }[] };
  bundleProduct: ProductOption & { images: { url: string }[]; variants: { price: number }[] };
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<BundleDeal[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    triggerProductId: "",
    bundleProductId: "",
    discountPercent: "10",
    startsAt: "",
    expiresAt: "",
  });

  const fetchBundles = async () => {
    const res = await fetch("/api/admin/bundles");
    const json = await res.json();
    if (json.success) setBundles(json.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products?limit=200");
    const json = await res.json();
    if (json.success) setProducts(json.data || json.products || []);
  };

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.triggerProductId || !form.bundleProductId || !form.discountPercent) {
      alert("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountPercent: Number(form.discountPercent),
          startsAt: form.startsAt || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setForm({ name: "", triggerProductId: "", bundleProductId: "", discountPercent: "10", startsAt: "", expiresAt: "" });
        fetchBundles();
      } else {
        alert(json.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/bundles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchBundles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bundle kampanyasını silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    fetchBundles();
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim Paneli</p>
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">🎁 Bundle Kampanyaları</h1>
          <p className="mt-3 text-sm text-stone-500 max-w-lg">
            Birlikte satın alındığında indirim uygulayan akıllı paket kampanyaları oluşturun.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Yeni Kampanya
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-stone-900 tracking-tighter">Yeni Bundle Kampanyası</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Kampanya Adı *</label>
              <input
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="ör: Akıllı Saat + Şarj Kablosu Paketi"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Ana Ürün (Sayfasında Gösterilecek) *</label>
              <select
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                value={form.triggerProductId}
                onChange={e => setForm(f => ({ ...f, triggerProductId: e.target.value }))}
              >
                <option value="">Ürün seçin...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Paket Ürünü (Önerilecek) *</label>
              <select
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                value={form.bundleProductId}
                onChange={e => setForm(f => ({ ...f, bundleProductId: e.target.value }))}
              >
                <option value="">Ürün seçin...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">İndirim Oranı (%) *</label>
              <input
                type="number"
                min="1"
                max="90"
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Bitiş Tarihi (Opsiyonel)</label>
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-stone-800 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> {submitting ? "Kaydediliyor..." : "Kampanyayı Oluştur"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-stone-200 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Bundle List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => <div key={i} className="h-48 rounded-3xl bg-stone-50 animate-pulse" />)}
        </div>
      ) : bundles.length === 0 ? (
        <div className="rounded-3xl bg-stone-50 p-20 text-center border border-stone-100">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-4" />
          <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Henüz bundle kampanyası yok</p>
          <p className="text-sm text-stone-400 mt-2">İlk kampanyanızı oluşturmak için "Yeni Kampanya" butonuna tıklayın.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bundles.map(bundle => {
            const triggerImg = bundle.triggerProduct.images?.[0]?.url;
            const bundleImg = bundle.bundleProduct.images?.[0]?.url;
            const isExpired = bundle.expiresAt && new Date(bundle.expiresAt) < new Date();

            return (
              <div key={bundle.id} className={`rounded-3xl border bg-white p-6 space-y-4 ${!bundle.active || isExpired ? "opacity-60" : ""}`}>
                {/* Status + Discount Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      %{bundle.discountPercent} İndirim
                    </span>
                    {isExpired && (
                      <span className="rounded-full bg-red-100 text-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Süresi Doldu</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(bundle.id, bundle.active)}>
                      {bundle.active
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6 text-stone-300" />}
                    </button>
                    <button onClick={() => handleDelete(bundle.id)}>
                      <Trash2 className="w-4 h-4 text-stone-300 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-stone-900 tracking-tight">{bundle.name}</h3>

                {/* Products */}
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100">
                    {triggerImg ? <Image src={triggerImg} alt={bundle.triggerProduct.name} fill className="object-cover" /> : <Package className="w-5 h-5 text-stone-300 m-auto mt-4" />}
                  </div>
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100">
                    {bundleImg ? <Image src={bundleImg} alt={bundle.bundleProduct.name} fill className="object-cover" /> : <Package className="w-5 h-5 text-stone-300 m-auto mt-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-700 truncate">{bundle.triggerProduct.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">+ {bundle.bundleProduct.name}</p>
                  </div>
                </div>

                {bundle.expiresAt && (
                  <p className="text-[10px] text-stone-400 font-medium">
                    Bitiş: {new Date(bundle.expiresAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
