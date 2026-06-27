"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth-store";
import { PackageSearch, Send, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

type RequestStatus = "PENDING" | "APPROVED" | "IN_STOCK_SOON" | "REJECTED";

type ProductRequest = {
  id: string;
  productName: string;
  brand: string | null;
  description: string | null;
  status: RequestStatus;
  adminNote: string | null;
  estimatedDays: number | null;
  createdAt: string;
};

function statusBadge(status: RequestStatus) {
  switch (status) {
    case "PENDING":
      return <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-600"><Clock className="w-3.5 h-3.5" /> Beklemede</div>;
    case "APPROVED":
      return <div className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı</div>;
    case "IN_STOCK_SOON":
      return <div className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700"><PackageSearch className="w-3.5 h-3.5" /> Yakında Gelecek</div>;
    case "REJECTED":
      return <div className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-700"><XCircle className="w-3.5 h-3.5" /> Karşılanamıyor</div>;
  }
}

export default function ProductRequestsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    description: "",
    guestName: "",
    guestEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [myRequests, setMyRequests] = useState<ProductRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyRequests();
    }
  }, [user]);

  async function loadMyRequests() {
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/product-requests");
      const data = await res.json();
      if (data.success) {
        setMyRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/product-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Talebiniz başarıyla alındı. Teşekkür ederiz!");
        setForm({ productName: "", brand: "", description: "", guestName: "", guestEmail: "" });
        if (user) {
          loadMyRequests();
        }
      } else {
        setErrorMsg(data.message || "Talep gönderilirken bir hata oluştu.");
      }
    } catch (error) {
      setErrorMsg("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 py-12 lg:py-24 animate-in fade-in duration-700">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 shadow-2xl shadow-stone-900/20">
            <PackageSearch className="h-9 w-9 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Aradığınızı Bulamadınız Mı?</p>
          <h1 className="mt-3 text-5xl font-black tracking-tighter text-stone-900 uppercase">
            Ürün Talep Et
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-relaxed text-stone-500">
            İstediğiniz ürünü bizimle paylaşın. Ekibimiz tedarik sürecini değerlendirip, ürünün stoklarımıza girip giremeyeceği veya tahmini geliş süresi hakkında size detaylı bilgi versin.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="rounded-[3rem] border border-stone-200 bg-white p-10 shadow-xl shadow-stone-200/50">
              <h2 className="mb-8 text-xl font-black tracking-tighter text-stone-900 uppercase">Talep Formu</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!user && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Adınız Soyadınız *</label>
                      <input
                        required
                        type="text"
                        value={form.guestName}
                        onChange={e => setForm({ ...form, guestName: e.target.value })}
                        className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">E-Posta Adresiniz *</label>
                      <input
                        required
                        type="email"
                        value={form.guestEmail}
                        onChange={e => setForm({ ...form, guestEmail: e.target.value })}
                        className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
                        placeholder="Örn: ahmet@example.com"
                      />
                      <p className="text-[10px] font-medium text-stone-400">Size geri dönüş yapabilmemiz için gereklidir.</p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Talep Edilen Ürün Adı / Modeli *</label>
                  <input
                    required
                    type="text"
                    value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
                    placeholder="Örn: iPhone 15 Pro Max 256GB Kılıf"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Marka (Opsiyonel)</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300"
                    placeholder="Örn: Spigen, Apple, vb."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ek Açıklama / Detay (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all placeholder:text-stone-300 resize-none"
                    placeholder="Ürün rengi, özel bir özelliği, beklentiniz vb. varsa belirtebilirsiniz."
                  />
                </div>

                {errorMsg && (
                  <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="rounded-2xl bg-green-50 p-4 border border-green-100 flex items-start gap-3 text-green-700">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">{successMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-stone-950 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.01] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>
              </form>
            </div>
          </div>

          {/* My Requests Section */}
          <div className="lg:col-span-7">
            {!user ? (
              <div className="flex h-full flex-col items-center justify-center rounded-[3rem] border border-dashed border-stone-300 p-12 text-center">
                <PackageSearch className="mb-6 h-12 w-12 text-stone-300" />
                <h3 className="mb-2 text-xl font-black text-stone-900">Taleplerinizi Takip Edin</h3>
                <p className="mb-8 max-w-sm text-sm font-medium leading-relaxed text-stone-500">
                  Giriş yaparak tüm ürün taleplerinizin durumunu ve ekibimizin değerlendirme notlarını bu alandan takip edebilirsiniz.
                </p>
                <Link
                  href="/login"
                  className="rounded-full bg-stone-100 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 hover:bg-stone-200 transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-end justify-between px-2 mb-2">
                  <h2 className="text-xl font-black tracking-tighter text-stone-900 uppercase">Taleplerim</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    {myRequests.length} Kayıt
                  </span>
                </div>

                {loadingRequests ? (
                  <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="rounded-[3rem] border border-dashed border-stone-200 bg-white/50 p-16 text-center">
                    <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Henüz bir ürün talebiniz bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map(request => (
                      <div key={request.id} className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                              {new Date(request.createdAt).toLocaleDateString("tr-TR", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <h3 className="text-lg font-black text-stone-900 uppercase">{request.productName}</h3>
                            {request.brand && (
                              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Marka: {request.brand}</p>
                            )}
                            {request.description && (
                              <p className="text-sm font-medium text-stone-600 mt-2 line-clamp-2">"{request.description}"</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {statusBadge(request.status)}
                          </div>
                        </div>

                        {/* Admin Note Section */}
                        {(request.adminNote || request.estimatedDays) && (
                          <div className="mt-6 rounded-2xl bg-stone-50 border border-stone-100 p-5">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[8px] text-stone-600">★</span>
                              Sunix Ekibi'nin Yanıtı
                            </p>
                            {request.adminNote && (
                              <p className="text-sm font-medium text-stone-800 leading-relaxed">
                                {request.adminNote}
                              </p>
                            )}
                            {request.estimatedDays && (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-50/50 border border-blue-100 px-4 py-2 text-xs font-bold text-blue-800">
                                <Clock className="h-4 w-4" />
                                Tahmini Stoğa Geliş: {request.estimatedDays} Gün
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
