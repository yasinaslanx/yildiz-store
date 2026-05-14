"use client";

import { useEffect, useState } from "react";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory } from "@/lib/api";
import { ImageUpload } from "@/components/admin/image-upload";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  _count?: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateAdminCategory(category.id, { active: !category.active });
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, active: !c.active } : c));
    } catch (err) {
      alert("Durum güncellenemedi");
    }
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, {
          name: form.name,
          description: form.description,
          image: form.image,
        });
      } else {
        await createAdminCategory({
          name: form.name,
          slug: form.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: form.description,
          image: form.image,
        });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      alert("Kategori kaydedilemedi");
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yapılandırma</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Kategoriler</h1>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setForm({ name: "", description: "", image: "" }); setIsModalOpen(true); }}
          className="cursor-pointer rounded-full border-2 border-black bg-white px-10 py-4 text-[11px] font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-100 transition hover:bg-stone-50 active:scale-95"
        >
           + Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
           {categories.map((category) => (
             <div key={category.id} className="group overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-stone-100">
                <div className="h-40 bg-stone-50 p-6 flex items-center justify-center relative overflow-hidden">
                   {category.image ? (
                     <img src={category.image} alt={category.name} className="h-full w-full object-cover rounded-2xl" />
                   ) : (
                     <div className="text-4xl text-stone-300">📁</div>
                   )}
                   <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => handleToggleActive(category)}
                        className={`rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${
                          category.active ? 'bg-green-50 text-green-600' : 'bg-white text-stone-400'
                        }`}
                      >
                         {category.active ? 'Aktif' : 'Pasif'}
                      </button>
                   </div>
                </div>
                <div className="p-8">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">{category.name}</h3>
                         <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">/{category.slug}</p>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-stone-50 border border-stone-100">
                         <span className="text-xs font-black text-stone-900">{category._count?.products || 0}</span>
                      </div>
                   </div>
                   <p className="text-xs font-medium text-stone-500 line-clamp-2 min-h-[2rem]">
                      {category.description || "Açıklama bulunmuyor."}
                   </p>
                   
                   <div className="mt-8 pt-6 border-t border-stone-100">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="w-full rounded-2xl bg-stone-50 py-3 text-[10px] font-black uppercase tracking-widest text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                      >
                         Düzenle
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-stone-50 p-8 border-b border-stone-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                       {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                    </h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <div className="p-10 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kategori Adı</label>
                    <input 
                      type="text" 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                      placeholder="Örn: Telefonlar"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Açıklama</label>
                    <textarea 
                      rows={3}
                      className="w-full rounded-3xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all resize-none shadow-inner"
                      placeholder="Kategori hakkında kısa bilgi..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                 </div>

                  <div className="space-y-4">
                     <ImageUpload 
                       label="Kategori Görseli Yükle"
                       onUploadSuccess={(url) => setForm({...form, image: url})}
                     />
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Veya Görsel URL</label>
                        <input 
                          type="text" 
                          className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                          placeholder="https://..."
                          value={form.image}
                          onChange={e => setForm({...form, image: e.target.value})}
                        />
                     </div>
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
                   disabled={!form.name}
                   className="flex-1 rounded-full border-2 border-black bg-stone-900 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-stone-200 transition hover:bg-black active:scale-95 disabled:opacity-50"
                 >
                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
