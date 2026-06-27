"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, PackageSearch, XCircle, MoreVertical } from "lucide-react";

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
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
};

export default function AdminProductRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  
  // Modal Form State
  const [formStatus, setFormStatus] = useState<RequestStatus>("PENDING");
  const [adminNote, setAdminNote] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await fetch("/api/admin/product-requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (req: ProductRequest) => {
    setSelectedRequest(req);
    setFormStatus(req.status);
    setAdminNote(req.adminNote || "");
    setEstimatedDays(req.estimatedDays ? req.estimatedDays.toString() : "");
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setFormStatus("PENDING");
    setAdminNote("");
    setEstimatedDays("");
  };

  const handleSave = async () => {
    if (!selectedRequest) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/admin/product-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formStatus,
          adminNote: adminNote.trim() || null,
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
          ...r,
          status: formStatus,
          adminNote: adminNote.trim() || null,
          estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
        } : r));
        handleCloseModal();
      } else {
        alert(data.message || "Kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  const filteredRequests = filterStatus === "ALL" 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/10"><Clock className="h-3 w-3" /> Beklemede</span>;
      case "APPROVED":
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="h-3 w-3" /> Onaylandı</span>;
      case "IN_STOCK_SOON":
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"><PackageSearch className="h-3 w-3" /> Yakında</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"><XCircle className="h-3 w-3" /> Reddedildi</span>;
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Ürün Talepleri</h1>
           
           <div className="mt-8 flex items-center gap-4">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Filtrele:</span>
              <div className="flex flex-wrap gap-2">
                 {["ALL", "PENDING", "APPROVED", "IN_STOCK_SOON", "REJECTED"].map((status) => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                       filterStatus === status 
                         ? 'bg-stone-900 text-white shadow-lg shadow-stone-200' 
                         : 'bg-white text-stone-400 border border-stone-100 hover:border-stone-300'
                     }`}
                   >
                     {status === 'ALL' ? 'Tümü' : status}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-500">
              <thead className="bg-stone-50 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Tarih</th>
                  <th scope="col" className="px-6 py-4">Müşteri</th>
                  <th scope="col" className="px-6 py-4">Ürün Adı</th>
                  <th scope="col" className="px-6 py-4">Marka</th>
                  <th scope="col" className="px-6 py-4">Durum</th>
                  <th scope="col" className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                      Bu durumda ürün talebi bulunmuyor.
                    </td>
                  </tr>
                ) : filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-stone-900 font-medium">
                      {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.userId ? (
                        <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/10">Üye</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-medium text-stone-900">{req.guestName}</span>
                          <span className="text-xs text-stone-500">{req.guestEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-900 font-medium">
                      {req.productName}
                      {req.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1" title={req.description}>"{req.description}"</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.brand || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(req)}
                        className="text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Talebi Yanıtla</p>
                <h2 className="mt-2 text-xl font-black tracking-tighter text-stone-900 uppercase">
                  {selectedRequest.productName}
                </h2>
                {selectedRequest.guestName && (
                  <p className="mt-1 text-xs text-stone-500">Müşteri: {selectedRequest.guestName} ({selectedRequest.guestEmail})</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as RequestStatus)}
                  className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all"
                >
                  <option value="PENDING">Beklemede</option>
                  <option value="APPROVED">Onaylandı (Eklenecek)</option>
                  <option value="IN_STOCK_SOON">Yakında Gelecek</option>
                  <option value="REJECTED">Reddedildi (Karşılanamıyor)</option>
                </select>
              </div>

              {formStatus === "IN_STOCK_SOON" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tahmini Gün Sayısı</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="Örn: 30"
                    className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Müşteriye Not (Opsiyonel)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Müşterinin görebileceği bir açıklama yazın..."
                  rows={4}
                  className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-5 py-4 text-sm font-bold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 rounded-full border-2 border-stone-200 py-4 text-[10px] font-black uppercase tracking-widest text-stone-900 hover:border-stone-900 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-full bg-stone-950 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors disabled:opacity-40"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
