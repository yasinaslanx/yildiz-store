"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchOrderDetail } from "@/lib/api";
import { toast } from "react-hot-toast";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string | null;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    brand: string;
    color: string;
    storage?: string | null;
    image?: string | null;
    price: number;
    quantity: number;
    total: number;
  }[];
};

const STATUS_STEPS = [
  { id: "PENDING", label: "Sipariş Alındı", icon: "📝", desc: "Talebiniz bize ulaştı." },
  { id: "CONFIRMED", label: "Onaylandı", icon: "✔️", desc: "Ödeme kontrol edildi." },
  { id: "SHIPPED", label: "Kargoda", icon: "🚚", desc: "Paketiniz yola çıktı." },
  { id: "DELIVERED", label: "Teslim Edildi", icon: "🏠", desc: "Keyifli kullanımlar!" },
];

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim edildi",
    CANCELLED: "İptal edildi",
  };
  return labels[status] ?? status;
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CASH_ON_DELIVERY: "Kapıda Ödeme",
    BANK_TRANSFER: "Banka Havalesi",
    CREDIT_CARD: "Kredi Kartı",
  };
  return labels[method] ?? method;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [returnReason, setReturnReason] = useState<string>("DEFECTIVE");
  const [explanation, setExplanation] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; quantity: number }>>({});
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!params.orderId) return;
        const data = await fetchOrderDetail(params.orderId);
        setOrder(data);

        // Initialize return items selection
        if (data?.items) {
          const initialMap: Record<string, { selected: boolean; quantity: number }> = {};
          data.items.forEach((item: { id: string; quantity: number }) => {
            initialMap[item.id] = { selected: true, quantity: item.quantity };
          });
          setSelectedItems(initialMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void loadOrder();
  }, [params.orderId]);

  const currentStatusIndex = order ? STATUS_STEPS.findIndex((s) => s.id === order.status) : -1;

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const itemsToSubmit = Object.entries(selectedItems)
      .filter(([, val]) => val.selected && val.quantity > 0)
      .map(([orderItemId, val]) => ({
        orderItemId,
        quantity: val.quantity,
      }));

    if (itemsToSubmit.length === 0) {
      toast.error("Lütfen iade/değişim yapılacak en az bir ürün seçin.");
      return;
    }

    if (!explanation.trim()) {
      toast.error("Lütfen iade gerekçenizle ilgili kısa bir açıklama girin.");
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          type: returnType,
          reason: returnReason,
          explanation: explanation.trim(),
          items: itemsToSubmit,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Talebiniz alındı!");
        setShowReturnModal(false);
        router.push("/returns");
      } else {
        toast.error(json.message || "Bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Talep iletilemedi.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-stone-100 border-t-black" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-stone-900 tracking-tighter">Sipariş Bulunamadı</h1>
        <Link href="/orders" className="mt-6 inline-block text-stone-400 underline uppercase tracking-widest text-[10px] font-black">
          Listeye Dön
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm">
            <Link
              href="/orders"
              className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition mb-10 group"
            >
              <svg className="transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Tüm Siparişlerim
            </Link>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sipariş No</p>
                <p className="text-lg font-black text-stone-900 tracking-tighter mt-1">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</p>
                <div className="mt-2 inline-block rounded-full bg-stone-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white">
                  {statusLabel(order.status)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ödeme</p>
                <p className="text-xs font-bold text-stone-600 mt-1 uppercase tracking-widest">
                  {paymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-stone-50 space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-4">Teslimat Adresi</h3>
                <p className="text-xs font-bold text-stone-900">{order.customerName}</p>
                <p className="mt-2 text-xs font-medium leading-relaxed text-stone-500 uppercase">
                  {order.shippingAddress}
                  <br />
                  {order.shippingDistrict} / {order.shippingCity}
                </p>
              </div>

              {/* Return CTA for Delivered Orders */}
              {order.status === "DELIVERED" && (
                <div className="pt-4 border-t border-stone-100">
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="w-full rounded-2xl bg-amber-500 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-600 transition shadow-lg shadow-amber-500/20"
                  >
                    ↩️ İade veya Değişim İste
                  </button>
                </div>
              )}

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Kargo Bilgisi</p>
                  {order.shippingCarrier && <p className="text-xs font-black text-stone-900 uppercase">{order.shippingCarrier}</p>}
                  <p className="text-base font-black text-stone-900 tracking-widest">{order.trackingNumber}</p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-stone-900 transition-colors"
                    >
                      🚚 Kargo Sitesine Git →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-12">
          {/* Live Tracking Timeline */}
          <section className="relative overflow-hidden rounded-[3rem] border border-stone-100 bg-white p-12 shadow-2xl shadow-stone-100">
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter mb-16">Sipariş Yolculuğu</h2>

            <div className="grid gap-12 lg:grid-cols-4">
              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={step.id} className="relative flex flex-col items-center text-center">
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className="absolute left-[calc(50%+2.5rem)] top-10 hidden h-0.5 w-[calc(100%-5rem)] bg-stone-50 lg:block">
                        <div
                          className="h-full bg-black transition-all duration-1000"
                          style={{ width: idx < currentStatusIndex ? "100%" : "0%" }}
                        />
                      </div>
                    )}

                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-3xl border-2 transition-all duration-700 ${
                        isActive ? "border-black bg-white text-stone-900 shadow-2xl shadow-stone-200" : "border-stone-50 bg-stone-50/50 text-stone-200"
                      } ${isCurrent ? "scale-110" : ""}`}
                    >
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="mt-8 space-y-2">
                      <p className={`text-xs font-black uppercase tracking-widest ${isActive ? "text-stone-900" : "text-stone-300"}`}>{step.label}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase leading-relaxed max-w-[140px]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order Items & Summary */}
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <section className="rounded-[3rem] border border-stone-100 bg-white p-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-10">Sipariş İçeriği</h3>
              <div className="space-y-8">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-8 group">
                    <div className="h-24 w-24 flex-shrink-0 rounded-[2rem] border border-stone-50 bg-white p-4 shadow-sm group-hover:scale-105 transition duration-500">
                      <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-stone-900 uppercase tracking-tighter">{item.productName}</p>
                      <p className="mt-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {item.brand} • {item.color} {item.storage ? `• ${item.storage}` : ""}
                      </p>
                      <p className="mt-3 inline-block rounded-lg bg-stone-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-stone-500">
                        {item.quantity} Adet
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-stone-900 tracking-tighter">{item.total.toLocaleString("tr-TR")} ₺</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Birim: {item.price.toLocaleString("tr-TR")} ₺</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Summary Card */}
            <section className="rounded-[3rem] bg-stone-900 p-10 text-white shadow-2xl shadow-stone-300">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-10">Finansal Özet</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ara Toplam</span>
                  <span className="text-sm font-black uppercase">{order.totalAmount.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kargo</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Ücretsiz</span>
                </div>
                <div className="pt-8 border-t border-stone-800 flex flex-col gap-2">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ödenecek Tutar</span>
                  <span className="text-4xl font-black tracking-tighter">{order.totalAmount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* RETURN MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 lg:p-10 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-stone-900">İade / Değişim Talebi</h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5">Sipariş #{order.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-6">
              {/* Type selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">İşlem Tipi</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setReturnType("RETURN")}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition ${
                      returnType === "RETURN"
                        ? "bg-stone-900 text-white border-stone-900 shadow-lg"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    ↩️ Ücret İadesi
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType("EXCHANGE")}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition ${
                      returnType === "EXCHANGE"
                        ? "bg-stone-900 text-white border-stone-900 shadow-lg"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    🔄 Ürün Değişimi
                  </button>
                </div>
              </div>

              {/* Items selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                  İade / Değişim Yapılacak Ürünler
                </label>
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const selState = selectedItems[item.id] || { selected: false, quantity: item.quantity };
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                          selState.selected ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selState.selected}
                            onChange={(e) => {
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.id]: { ...selState, selected: e.target.checked },
                              }));
                            }}
                            className="h-5 w-5 rounded border-stone-300 accent-stone-900"
                          />
                          <div>
                            <p className="text-xs font-black text-stone-900 uppercase">{item.productName}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase">
                              {item.brand} • {item.color} {item.storage ? `• ${item.storage}` : ""}
                            </p>
                          </div>
                        </div>

                        {selState.selected && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Adet:</span>
                            <select
                              value={selState.quantity}
                              onChange={(e) => {
                                const q = Number(e.target.value);
                                setSelectedItems((prev) => ({
                                  ...prev,
                                  [item.id]: { ...selState, quantity: q },
                                }));
                              }}
                              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-black"
                            >
                              {Array.from({ length: item.quantity }, (_, i) => i + 1).map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Talebin Neden Nenedi</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-xs font-black text-stone-900"
                >
                  <option value="DEFECTIVE">Defolu / Hasarlı Ürün</option>
                  <option value="WRONG_ITEM">Yanlış Ürün Gönderildi</option>
                  <option value="DONT_LIKE">Vazgeçtim / Beğenmedim</option>
                  <option value="OTHER">Diğer Gerekçe</option>
                </select>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Detaylı Açıklama</label>
                <textarea
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Ürün durumu, yaşadığınız sorun veya değişim istediğiniz renk/model hakkında detay verin..."
                  className="w-full rounded-2xl border border-stone-200 p-4 text-xs font-medium text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-4 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="w-1/2 rounded-2xl border border-stone-200 py-4 text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="w-1/2 rounded-2xl bg-stone-900 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-stone-800 transition disabled:opacity-50"
                >
                  {submittingReturn ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
