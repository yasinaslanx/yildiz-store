"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type ReturnItem = {
  id: string;
  productName: string;
  brand: string;
  color: string;
  storage?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
};

type ReturnRequest = {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  type: "RETURN" | "EXCHANGE";
  status: "PENDING" | "APPROVED" | "CARGO_WAITING" | "RECEIVED" | "COMPLETED" | "REJECTED";
  reason: string;
  explanation: string;
  images: string[];
  cargoCarrier?: string | null;
  cargoCode?: string | null;
  adminNote?: string | null;
  refundAmount?: number | null;
  createdAt: string;
  items: ReturnItem[];
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; desc: string }> = {
  PENDING: {
    label: "İncelemede",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    desc: "Talebiniz müşteri hizmetlerimiz tarafından inceleniyor.",
  },
  APPROVED: {
    label: "Onaylandı - Kargo Bekleniyor",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    desc: "Talebiniz onaylandı. Lütfen ürünü belirtilen kargo koduyla gönderin.",
  },
  CARGO_WAITING: {
    label: "Kargoda",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    desc: "Ürününüz depomuza ulaşmak üzere kargoda.",
  },
  RECEIVED: {
    label: "Teslim Alındı / Kontrol Ediliyor",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    desc: "Ürün depomuza ulaştı, teknik kontrol yapılıyor.",
  },
  COMPLETED: {
    label: "Tamamlandı",
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    desc: "İade/Değişim işleminiz başarıyla tamamlandı.",
  },
  REJECTED: {
    label: "Reddedildi",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    desc: "İade talebiniz uygun görülmedi.",
  },
};

const REASON_LABELS: Record<string, string> = {
  DEFECTIVE: "Defolu / Hasarlı Ürün",
  WRONG_ITEM: "Yanlış Ürün Gönderildi",
  DONT_LIKE: "Vazgeçtim / Beğenmedim",
  OTHER: "Diğer",
};

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReturns() {
      try {
        const res = await fetch("/api/returns");
        const json = await res.json();
        if (json.success) {
          setReturns(json.data);
        } else {
          toast.error(json.message || "Talepler yüklenemedi.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    void loadReturns();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-stone-100 border-t-black" />
        <p className="mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Talepler Yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12 lg:py-20 animate-in fade-in duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/orders" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition">
            ← Siparişlerime Dön
          </Link>
        </div>
        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-stone-900">
          İade & Değişim Taleplerim
        </h1>
        <p className="mt-2 text-stone-500 font-medium">
          Oluşturduğunuz tüm iade ve değişim taleplerinin durumunu ve kargo takip süreçlerini buradan izleyebilirsiniz.
        </p>
      </header>

      {returns.length === 0 ? (
        <div className="rounded-[3rem] border border-stone-100 bg-stone-50/50 p-16 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm mb-6">
            📦
          </div>
          <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Henüz bir iade veya değişim talebiniz yok</h2>
          <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest max-w-md mx-auto">
            Teslim alınan siparişlerinizin detay sayfasından kolayca iade veya değişim talebi oluşturabilirsiniz.
          </p>
          <Link
            href="/orders"
            className="mt-8 inline-block rounded-full bg-stone-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-stone-800 transition"
          >
            Siparişlerime Git
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {returns.map((ret) => {
            const statusCfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG.PENDING;
            return (
              <div
                key={ret.id}
                className="rounded-[2.5rem] border border-stone-100 bg-white p-8 lg:p-10 shadow-xl shadow-stone-100/50 space-y-8"
              >
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 border-b border-stone-100 pb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                        {ret.type === "EXCHANGE" ? "🔄 Ürün Değişimi" : "↩️ Ürün İadesi"}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-bold text-stone-400 uppercase">
                        Sipariş #{ret.orderNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight mt-1">
                      Talep No: {ret.returnNumber}
                    </h3>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                      Oluşturulma: {new Date(ret.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                  <div className={`rounded-2xl border px-5 py-3 ${statusCfg.bg}`}>
                    <p className={`text-xs font-black uppercase tracking-widest ${statusCfg.text}`}>
                      {statusCfg.label}
                    </p>
                    <p className="text-[10px] font-medium text-stone-600 mt-0.5">{statusCfg.desc}</p>
                  </div>
                </div>

                {/* Cargo Code Banner (if approved/waiting) */}
                {ret.cargoCode && (
                  <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                        Anlaşmalı İade Kargo Kodunuz ({ret.cargoCarrier || "Yurtiçi Kargo"})
                      </p>
                      <p className="text-2xl font-black tracking-widest mt-1 font-mono">{ret.cargoCode}</p>
                      <p className="text-xs font-medium text-blue-100 mt-1">
                        Ürünü orijinal kutusunda eksiksiz paketleyip kargo şubesine bu kodla ücretsiz teslim edebilirsiniz.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ret.cargoCode!);
                        toast.success("Kargo kodu kopyalandı!");
                      }}
                      className="px-6 py-3 bg-white text-stone-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition shrink-0"
                    >
                      Kodu Kopyala
                    </button>
                  </div>
                )}

                {/* Admin Note if any */}
                {ret.adminNote && (
                  <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Yönetici Notu</p>
                    <p className="text-xs font-medium text-stone-800 mt-1">{ret.adminNote}</p>
                  </div>
                )}

                {/* Refund Amount if completed */}
                {ret.refundAmount && (
                  <div className="rounded-2xl bg-green-50 border border-green-200 p-5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-700">İade Edilen Tutar</p>
                      <p className="text-xl font-black text-green-900 mt-0.5">{ret.refundAmount.toLocaleString("tr-TR")} ₺</p>
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      ✓ Hesaba Aktarıldı
                    </span>
                  </div>
                )}

                {/* Return Details & Items */}
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">
                      Talebe Konu Ürünler
                    </h4>
                    <div className="space-y-4">
                      {ret.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                          <div className="h-16 w-16 bg-white rounded-xl p-2 flex-shrink-0 border border-stone-100">
                            <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-stone-900 uppercase">{item.productName}</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">
                              {item.brand} • {item.color} {item.storage ? `• ${item.storage}` : ""}
                            </p>
                            <p className="text-[10px] font-black text-stone-700 uppercase mt-1">
                              {item.quantity} Adet × {item.price.toLocaleString("tr-TR")} ₺
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">
                      İade Nedeniniz & Açıklamanız
                    </h4>
                    <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">Gerekçe</p>
                        <p className="text-xs font-black text-stone-900 uppercase">{REASON_LABELS[ret.reason] || ret.reason}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase">Açıklama</p>
                        <p className="text-xs font-medium text-stone-700 leading-relaxed">{ret.explanation}</p>
                      </div>
                      {ret.images && ret.images.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Eklenen Fotoğraflar</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {ret.images.map((imgUrl, i) => (
                              <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="h-14 w-14 rounded-xl border overflow-hidden shrink-0">
                                <img src={imgUrl} alt="Kanıt" className="h-full w-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
