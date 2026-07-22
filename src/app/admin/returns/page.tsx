"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search, RefreshCw } from "lucide-react";

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
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
  };
  items: ReturnItem[];
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "İncelemede", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  APPROVED: { label: "Onaylandı (Kargo Bekleniyor)", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  CARGO_WAITING: { label: "Kargoda", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  RECEIVED: { label: "Depoda / Kontrolde", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  COMPLETED: { label: "Tamamlandı", badge: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Reddedildi", badge: "bg-red-100 text-red-800 border-red-200" },
};

const REASON_MAP: Record<string, string> = {
  DEFECTIVE: "Defolu / Hasarlı",
  WRONG_ITEM: "Yanlış Ürün",
  DONT_LIKE: "Vazgeçti / Beğenmedi",
  OTHER: "Diğer",
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal edit state
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editCargoCarrier, setEditCargoCarrier] = useState<string>("Yurtiçi Kargo");
  const [editCargoCode, setEditCargoCode] = useState<string>("");
  const [editAdminNote, setEditAdminNote] = useState<string>("");
  const [editRefundAmount, setEditRefundAmount] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/returns?status=${filterStatus}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setReturns(json.data);
      } else {
        toast.error(json.message || "Veriler alınamadı.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    void fetchReturns();
  }, [fetchReturns]);

  const handleOpenEdit = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setEditStatus(ret.status);
    setEditCargoCarrier(ret.cargoCarrier || "Yurtiçi Kargo");
    setEditCargoCode(ret.cargoCode || "");
    setEditAdminNote(ret.adminNote || "");
    setEditRefundAmount(ret.refundAmount ? String(ret.refundAmount) : "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/returns/${selectedReturn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          cargoCarrier: editCargoCarrier.trim() || null,
          cargoCode: editCargoCode.trim() || null,
          adminNote: editAdminNote.trim() || null,
          refundAmount: editRefundAmount ? Number(editRefundAmount) : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Talep başarıyla güncellendi.");
        setSelectedReturn(null);
        fetchReturns();
      } else {
        toast.error(json.message || "Güncelleme başarısız.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = returns.filter((r) => r.status === "PENDING").length;
  const approvedCount = returns.filter((r) => r.status === "APPROVED" || r.status === "CARGO_WAITING").length;
  const completedCount = returns.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Müşteri Hizmetleri</p>
          <h1 className="text-3xl font-black tracking-tighter text-stone-900 uppercase">
            İade & Değişim Yönetimi (RMA)
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            Müşteriler tarafından oluşturulan tüm iade ve değişim taleplerini inceleyin ve kargo kodları tanımlayın.
          </p>
        </div>
        <button
          onClick={fetchReturns}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-stone-200 px-5 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </header>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2.5rem] bg-amber-50/80 border border-amber-200/60 p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Bekleyen Talepler</p>
            <p className="text-3xl font-black text-amber-900 mt-1">{pendingCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xl">
            ⏳
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-blue-50/80 border border-blue-200/60 p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Kargo Sürecinde</p>
            <p className="text-3xl font-black text-blue-900 mt-1">{approvedCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
            🚚
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-green-50/80 border border-green-200/60 p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Tamamlanan İadeler</p>
            <p className="text-3xl font-black text-green-900 mt-1">{completedCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-800 font-bold text-xl">
            ✅
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[2.5rem] bg-white border border-stone-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { key: "ALL", label: "Tümü" },
            { key: "PENDING", label: "İncelemede" },
            { key: "APPROVED", label: "Onaylandı" },
            { key: "CARGO_WAITING", label: "Kargoda" },
            { key: "COMPLETED", label: "Tamamlandı" },
            { key: "REJECTED", label: "Reddedildi" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${
                filterStatus === tab.key
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-stone-50 text-stone-500 hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReturns();
          }}
          className="relative w-full md:w-80"
        >
          <input
            type="text"
            placeholder="Talep no, sipariş no veya müşteri..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 transition"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3" />
        </form>
      </div>

      {/* Returns Table */}
      <div className="rounded-[2.5rem] bg-white border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-black" />
            <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest">Yükleniyor...</p>
          </div>
        ) : returns.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Kayıtlı talep bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <th className="py-4 px-6">Talep & Sipariş No</th>
                  <th className="py-4 px-6">Müşteri</th>
                  <th className="py-4 px-6">İşlem Tipi</th>
                  <th className="py-4 px-6">Sebep</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6">Tarih</th>
                  <th className="py-4 px-6 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-medium">
                {returns.map((ret) => {
                  const st = STATUS_LABELS[ret.status] || STATUS_LABELS.PENDING;
                  return (
                    <tr key={ret.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-4 px-6">
                        <p className="font-black text-stone-900">{ret.returnNumber}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">
                          Sipariş #{ret.order.orderNumber}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-stone-900">
                          {ret.user.firstName} {ret.user.lastName}
                        </p>
                        <p className="text-[10px] text-stone-400 font-bold">{ret.user.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            ret.type === "EXCHANGE" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {ret.type === "EXCHANGE" ? "🔄 Değişim" : "↩️ İade"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-stone-800">{REASON_MAP[ret.reason] || ret.reason}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block border px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${st.badge}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-500 font-bold">
                        {new Date(ret.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(ret)}
                          className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition"
                        >
                          İncele & Güncelle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-3xl rounded-[2.5rem] bg-white p-8 lg:p-10 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">İade Talebi İnceleme</p>
                <h3 className="text-2xl font-black uppercase tracking-tight text-stone-900">
                  {selectedReturn.returnNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Order summary */}
            <div className="grid grid-cols-2 gap-4 bg-stone-50 p-5 rounded-2xl border border-stone-100 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400">Müşteri Bilgisi</p>
                <p className="font-black text-stone-900 mt-1">
                  {selectedReturn.user.firstName} {selectedReturn.user.lastName}
                </p>
                <p className="text-stone-500">{selectedReturn.user.email}</p>
                {selectedReturn.user.phone && <p className="text-stone-500">{selectedReturn.user.phone}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400">Sipariş Bilgisi</p>
                <p className="font-black text-stone-900 mt-1">Sipariş #{selectedReturn.order.orderNumber}</p>
                <p className="text-stone-500">Sipariş Tutarı: {selectedReturn.order.totalAmount.toLocaleString("tr-TR")} ₺</p>
              </div>
            </div>

            {/* Returned Items */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">İade Edilen Ürünler</p>
              <div className="space-y-3">
                {selectedReturn.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-stone-50/50 p-3 rounded-2xl border border-stone-100">
                    <div className="h-14 w-14 bg-white rounded-xl p-2 border border-stone-100 shrink-0">
                      <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-stone-900 uppercase">{item.productName}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">
                        {item.brand} • {item.color} {item.storage ? `• ${item.storage}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-stone-900">{item.quantity} Adet</p>
                      <p className="text-[10px] font-bold text-stone-400">{item.price.toLocaleString("tr-TR")} ₺</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason & Explanation */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 text-xs space-y-2">
              <p className="font-bold text-stone-900 uppercase">
                Gerekçe: {REASON_MAP[selectedReturn.reason] || selectedReturn.reason}
              </p>
              <p className="text-stone-700 font-medium">Açıklama: {selectedReturn.explanation}</p>
            </div>

            {/* Admin Action Form */}
            <form onSubmit={handleUpdate} className="space-y-6 pt-4 border-t border-stone-100">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Talep Durumu</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-black text-stone-900"
                  >
                    <option value="PENDING">İncelemede</option>
                    <option value="APPROVED">Onaylandı (Kargo Bekleniyor)</option>
                    <option value="CARGO_WAITING">Kargoda</option>
                    <option value="RECEIVED">Depoda / Kontrol Ediliyor</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="REJECTED">Reddedildi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Anlaşmalı Kargo Firması
                  </label>
                  <input
                    type="text"
                    value={editCargoCarrier}
                    onChange={(e) => setEditCargoCarrier(e.target.value)}
                    placeholder="Örn: Yurtiçi Kargo, MNG..."
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Anlaşmalı İade Kargo Kodu
                  </label>
                  <input
                    type="text"
                    value={editCargoCode}
                    onChange={(e) => setEditCargoCode(e.target.value)}
                    placeholder="Müşterinin kargoya vereceği iade kodu..."
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold font-mono text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    Ücret İadesi Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRefundAmount}
                    onChange={(e) => setEditRefundAmount(e.target.value)}
                    placeholder="Örn: 1450.00"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                  Müşteriye Gösterilecek Yönetici Notu
                </label>
                <textarea
                  rows={3}
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  placeholder="Müşteriye iletilecek bilgilendirme mesajı veya ret gerekçesi..."
                  className="w-full rounded-2xl border border-stone-200 p-4 text-xs font-medium text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="w-1/2 rounded-2xl border border-stone-200 py-4 text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 rounded-2xl bg-stone-900 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-stone-800 transition disabled:opacity-50"
                >
                  {updating ? "Kaydediliyor..." : "Kaydet ve Müşteriye Bildir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
