"use client";

import { useEffect, useState } from "react";
import { Check, X, Building2, Phone, FileText, UserCircle } from "lucide-react";

type DealerApplication = {
  id: string;
  userId: string;
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  phone: string;
  address: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export default function AdminDealersPage() {
  const [applications, setApplications] = useState<DealerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dealers/applications?status=${filter}`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Başvurular yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Bu başvuruyu ${status === "APPROVED" ? "onaylamak" : "reddetmek"} istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/dealers/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      
      if (json.success) {
        fetchApplications();
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert("Durum güncellenirken bir hata oluştu.");
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim Paneli</p>
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Bayi Yönetimi</h1>
        </div>

        <div className="flex bg-white rounded-full p-1 border border-stone-100 shadow-sm">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                filter === status 
                  ? "bg-stone-900 text-white shadow-md" 
                  : "text-stone-400 hover:text-stone-900"
              }`}
            >
              {status === "PENDING" ? "Bekleyen" : status === "APPROVED" ? "Onaylanan" : status === "REJECTED" ? "Reddedilen" : "Tümü"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl font-bold text-center border-2 border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-stone-100 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-stone-100 shadow-sm">
          <p className="text-stone-400 font-bold uppercase tracking-widest">Bu kategoride başvuru bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-lg shadow-stone-200/20 flex flex-col transition-all hover:shadow-xl hover:border-stone-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                <div className="h-12 w-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-stone-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight leading-none">{app.companyName}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-stone-400">
                    <UserCircle className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{app.user.firstName} {app.user.lastName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">E-Posta</p>
                  <p className="text-sm font-bold text-stone-600 truncate">{app.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-300" />
                  <p className="text-sm font-bold text-stone-600">{app.phone}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Vergi Dairesi</p>
                    <p className="text-xs font-bold text-stone-900 truncate">{app.taxOffice}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">V. No / TCKN</p>
                    <p className="text-xs font-bold text-stone-900">{app.taxNumber}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Adres
                  </p>
                  <p className="text-xs font-medium text-stone-500 leading-relaxed line-clamp-2">{app.address}</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-stone-100">
                {app.status === "PENDING" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(app.id, "APPROVED")}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-green-50 text-green-600 font-black uppercase tracking-widest text-[10px] hover:bg-green-100 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Onayla
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reddet
                    </button>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center gap-2 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] ${
                    app.status === "APPROVED" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                    {app.status === "APPROVED" ? (
                      <><Check className="w-4 h-4" /> Onaylandı</>
                    ) : (
                      <><X className="w-4 h-4" /> Reddedildi</>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
