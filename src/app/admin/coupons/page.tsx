"use client";

import { useEffect, useState } from "react";
import { fetchAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon } from "@/lib/api";
import { Ticket, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    usageLimit: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
      toast.error("Kuponlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateAdminCoupon(coupon.id, { active: !coupon.active });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      toast.success("Durum güncellendi");
    } catch (err) {
      toast.error("Durum güncellenemedi");
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAdminCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast.success("Kupon silindi");
    } catch (err) {
      toast.error("Kupon silinemedi");
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        active: true,
      };

      if (editingCoupon) {
        await updateAdminCoupon(editingCoupon.id, payload);
        toast.success("Kupon güncellendi");
      } else {
        await createAdminCoupon(payload);
        toast.success("Kupon oluşturuldu");
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || "Kupon kaydedilemedi");
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Pazarlama</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Kuponlar</h1>
        </div>
        <button 
          onClick={() => { setEditingCoupon(null); setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", usageLimit: "", expiresAt: "" }); setIsModalOpen(true); }}
          className="cursor-pointer rounded-full border-2 border-black bg-white px-10 py-4 text-[11px] font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-100 transition hover:bg-stone-50 active:scale-95"
        >
           + Yeni Kupon
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
           {coupons.map((coupon) => (
             <div key={coupon.id} className="group overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-stone-100">
                <div className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-green-50 text-green-600">
                            <Ticket className="w-6 h-6" />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-stone-900 tracking-tighter">{coupon.code}</h3>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                              {coupon.discountType === "PERCENTAGE" ? "% İndirim" : "Sabit İndirim"}
                            </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleToggleActive(coupon)}
                        className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${
                          coupon.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                         {coupon.active ? 'Aktif' : 'Pasif'}
                      </button>
                   </div>
                   
                   <div className="space-y-4 text-sm font-medium text-stone-600">
                      <div className="flex justify-between items-center pb-2 border-b border-stone-50">
                         <span className="text-stone-400">İndirim Miktarı</span>
                         <span className="font-black text-stone-900">
                           {coupon.discountType === "PERCENTAGE" ? `%${coupon.discountValue}` : `${coupon.discountValue} ₺`}
                         </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-stone-50">
                         <span className="text-stone-400">Kullanım</span>
                         <span className="font-bold text-stone-900">{coupon.usedCount} / {coupon.usageLimit || "Sınırsız"}</span>
                      </div>
                      {coupon.expiresAt && (
                        <div className="flex justify-between items-center pb-2 border-b border-stone-50">
                           <span className="text-stone-400">Son Kullanma</span>
                           <span className="font-bold text-red-600">{new Date(coupon.expiresAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-stone-100 flex gap-4">
                      <button 
                        onClick={() => handleEdit(coupon)}
                        className="flex-1 rounded-2xl bg-stone-50 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                      >
                         <Edit2 className="w-4 h-4" /> Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="flex-none rounded-2xl bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-stone-50 p-8 border-b border-stone-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                       {editingCoupon ? 'Kuponu Düzenle' : 'Yeni Kupon Ekle'}
                    </h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kupon Kodu</label>
                    <input 
                      type="text" 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner uppercase"
                      placeholder="Örn: YAZ20"
                      value={form.code}
                      onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">İndirim Tipi</label>
                       <select 
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         value={form.discountType}
                         onChange={e => setForm({...form, discountType: e.target.value})}
                       >
                         <option value="PERCENTAGE">Yüzde (%)</option>
                         <option value="FIXED">Sabit Tutar (₺)</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">İndirim Değeri</label>
                       <input 
                         type="number" 
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         placeholder={form.discountType === "PERCENTAGE" ? "Örn: 20" : "Örn: 50"}
                         value={form.discountValue}
                         onChange={e => setForm({...form, discountValue: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kullanım Limiti (İsteğe Bağlı)</label>
                    <input 
                      type="number" 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                      placeholder="Sınırsız ise boş bırakın"
                      value={form.usageLimit}
                      onChange={e => setForm({...form, usageLimit: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Son Kullanma Tarihi (İsteğe Bağlı)</label>
                    <input 
                      type="datetime-local" 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                      value={form.expiresAt}
                      onChange={e => setForm({...form, expiresAt: e.target.value})}
                    />
                 </div>
              </div>

              <div className="p-10 border-t border-stone-100 bg-stone-50/50 flex gap-4">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 rounded-full border-2 border-stone-100 bg-white py-5 text-[11px] font-black uppercase tracking-widest text-stone-400 transition hover:border-stone-200 hover:text-stone-600 active:scale-95"
                 >
                    İptal
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={!form.code || !form.discountValue}
                   className="flex-1 rounded-full border-2 border-black bg-stone-900 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-stone-200 transition hover:bg-black active:scale-95 disabled:opacity-50"
                 >
                    {editingCoupon ? 'Güncelle' : 'Kaydet'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
