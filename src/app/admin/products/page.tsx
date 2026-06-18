"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createAdminProductRequest,
  fetchAdminProducts,
  updateAdminProductRequest,
  updateAdminVariantRequest,
  fetchAdminCategories,
  bulkUpdatePricesRequest,
} from "@/lib/api";
import { ImageUpload } from "@/components/admin/image-upload";
import toast from "react-hot-toast";

type AdminVariant = {
  id: string;
  sku: string;
  color: string;
  storage?: string | null;
  price: number;
  wholesalePrice?: number | null;
  oldPrice?: number | null;
  stock: number;
  active: boolean;
  images?: { url: string }[];
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  active: boolean;
  isEarlyAccess: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants: AdminVariant[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk Operations State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTab, setBulkTab] = useState<"all" | "single">("all");
  const [bulkAction, setBulkAction] = useState<"increase" | "decrease">("increase");
  const [bulkPercentage, setBulkPercentage] = useState("");
  const [bulkSku, setBulkSku] = useState("");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    categoryId: "",
    isEarlyAccess: false,
    mainImage: "",
    newVariants: [] as any[],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      description: product.description,
      categoryId: product.categoryId,
      isEarlyAccess: product.isEarlyAccess,
      mainImage: product.variants[0]?.images?.[0]?.url || "",
      newVariants: [],
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await updateAdminProductRequest(product.id, { active: !product.active });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
    } catch (err) {
      alert("Durum güncellenemedi");
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Envanter</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Ürün Yönetimi</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="cursor-pointer rounded-full border-2 border-stone-200 bg-stone-100 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-900 shadow-sm transition hover:bg-stone-200 active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            Hızlı / Toplu İşlemler
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setForm({ name: "", brand: "", description: "", categoryId: "", isEarlyAccess: false, mainImage: "", newVariants: [] }); setIsModalOpen(true); }}
            className="cursor-pointer rounded-full border-2 border-black bg-white px-10 py-4 text-[11px] font-black uppercase tracking-widest text-stone-900 shadow-xl shadow-stone-100 transition hover:bg-stone-50 active:scale-95"
          >
             + Yeni Ürün Ekle
          </button>
        </div>
      </div>
      
      {/* Arama Barı */}
      <div className="mb-8 max-w-xl">
         <div className="relative group">
            <input 
              type="text" 
              placeholder="Ürün adı veya Ürün Kodu (SKU) ile ara..." 
              className="w-full rounded-2xl border border-stone-100 bg-white px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black transition-all shadow-sm group-hover:shadow-md"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-black transition">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-100 border-t-black" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-stone-50/50 border-b border-stone-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün Bilgisi</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Marka / Kategori</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Varyantlar</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Fiyat Aralığı</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Durum</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">İşlem</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                  {products
                    .filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((product) => {
                    const minPrice = Math.min(...product.variants.map(v => v.price));
                    const maxPrice = Math.max(...product.variants.map(v => v.price));
                    return (
                      <tr key={product.id} className="group hover:bg-stone-50/30 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="h-14 w-14 rounded-2xl border border-stone-100 bg-white p-2 flex-shrink-0">
                                  <img 
                                    src={product.variants[0]?.images?.[0]?.url || "https://placehold.co/100"} 
                                    alt={product.name} 
                                    className="h-full w-full object-contain"
                                  />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-stone-900 group-hover:underline underline-offset-4">{product.name}</p>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{product.slug}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-black text-stone-900 uppercase tracking-widest">{product.brand}</span>
                            <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">{product.category?.name || 'Kategorisiz'}</p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1.5">
                               {product.variants.map(v => (
                                 <span key={v.id} className="inline-block px-2 py-1 rounded-lg border border-stone-100 bg-white text-[9px] font-black uppercase tracking-widest text-stone-500">
                                    {v.color} {v.storage ? `/ ${v.storage}` : ''}
                                 </span>
                               ))}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-sm font-black text-stone-900 tracking-tighter">
                               {minPrice === maxPrice ? `${minPrice.toLocaleString()} ₺` : `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} ₺`}
                            </p>
                         </td>
                         <td className="px-8 py-6">
                            <button 
                              onClick={() => handleToggleActive(product)}
                              className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                                product.active 
                                  ? 'bg-green-50 text-green-600 border border-green-100' 
                                  : 'bg-stone-50 text-stone-400 border border-stone-100'
                              }`}
                            >
                               {product.active ? 'Aktif' : 'Pasif'}
                            </button>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => handleEdit(product)}
                                 className="cursor-pointer text-stone-400 hover:text-stone-900 transition p-2"
                                 title="Düzenle"
                               >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                               </button>
                               <Link 
                                 href={`/products/${product.slug}`} 
                                 target="_blank"
                                 className="text-stone-400 hover:text-stone-900 transition p-2"
                                 title="Sitede Gör"
                               >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                               </Link>
                            </div>
                         </td>
                      </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-2xl overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-stone-50 p-8 border-b border-stone-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                       {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                    </h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Lütfen tüm alanları eksiksiz doldurun</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Ürün Adı</label>
                       <input 
                         type="text" 
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         placeholder="iPhone 17 Pro Max"
                         value={form.name}
                         onChange={e => setForm({...form, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Marka</label>
                       <input 
                         type="text" 
                         className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                         placeholder="Apple"
                         value={form.brand}
                         onChange={e => setForm({...form, brand: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kategori</label>
                    <select 
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner appearance-none"
                      value={form.categoryId}
                      onChange={e => setForm({...form, categoryId: e.target.value})}
                    >
                       <option value="">Kategori Seçin</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>

                 <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                    <label className="relative flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={form.isEarlyAccess} onChange={e => setForm({...form, isEarlyAccess: e.target.checked})} />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-blue-900">Bayilere Özel (Erken Erişim)</p>
                       <p className="text-[10px] font-bold text-blue-600/70">Bu ürünü sadece bayiler görebilir.</p>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Açıklama</label>
                    <textarea 
                      rows={4}
                      className="w-full rounded-3xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all resize-none shadow-inner"
                      placeholder="Ürün özelliklerini buraya yazın..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                 </div>

                  {!editingProduct && (
                    <>
                      <div className="space-y-1.5">
                         <ImageUpload 
                           onUploadSuccess={(url) => setForm({...form, mainImage: url})}
                           label="Ana Görsel Yükle" 
                         />
                         <input 
                           type="text" 
                           className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner mt-2"
                           placeholder="Veya bir URL yapıştırın..."
                           value={form.mainImage}
                           onChange={e => setForm({...form, mainImage: e.target.value})}
                         />
                      </div>

                      {/* YENİ VARYANT EKLEME BÖLÜMÜ */}
                      <div className="space-y-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Varyant Ekle (Opsiyonel)</p>
                          <button 
                            type="button" 
                            onClick={() => setForm({...form, newVariants: [...form.newVariants, { sku: "", color: "", storage: "", price: 0, wholesalePrice: 0, oldPrice: "", stock: 0 }]})}
                            className="rounded-full bg-stone-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-200 transition active:scale-95"
                          >
                            + Yeni Varyant
                          </button>
                        </div>
                        {form.newVariants.map((nv, idx) => (
                          <div key={idx} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4 relative">
                             <div className="grid grid-cols-2 gap-4 pr-8">
                                <input type="text" placeholder="Renk (Örn: Titanyum)" className="w-full rounded-xl border border-stone-100 bg-white px-4 py-3 text-[11px] font-bold outline-none focus:border-black" value={nv.color} onChange={e => { const arr = [...form.newVariants]; arr[idx].color = e.target.value; setForm({...form, newVariants: arr})}} />
                                <input type="text" placeholder="Hafıza (Örn: 256 GB)" className="w-full rounded-xl border border-stone-100 bg-white px-4 py-3 text-[11px] font-bold outline-none focus:border-black" value={nv.storage} onChange={e => { const arr = [...form.newVariants]; arr[idx].storage = e.target.value; setForm({...form, newVariants: arr})}} />
                             </div>
                             <div className="grid grid-cols-5 gap-4">
                                <input type="text" placeholder="SKU Kodu" className="w-full rounded-xl border border-stone-100 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-black" value={nv.sku} onChange={e => { const arr = [...form.newVariants]; arr[idx].sku = e.target.value; setForm({...form, newVariants: arr})}} />
                                <input type="number" placeholder="Eski Fiyat" className="w-full rounded-xl border border-stone-100 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-black" value={nv.oldPrice} onChange={e => { const arr = [...form.newVariants]; arr[idx].oldPrice = e.target.value; setForm({...form, newVariants: arr})}} />
                                <input type="number" placeholder="Fiyat (₺)" className="w-full rounded-xl border border-stone-100 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-black" value={nv.price || ""} onChange={e => { const arr = [...form.newVariants]; arr[idx].price = Number(e.target.value); setForm({...form, newVariants: arr})}} />
                                <input type="number" placeholder="Bayi Fiyatı (₺)" className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500 text-blue-900" value={nv.wholesalePrice || ""} onChange={e => { const arr = [...form.newVariants]; arr[idx].wholesalePrice = Number(e.target.value); setForm({...form, newVariants: arr})}} />
                                <input type="number" placeholder="Stok Adeti" className="w-full rounded-xl border border-stone-100 bg-white px-3 py-2 text-[10px] font-bold outline-none focus:border-black" value={nv.stock || ""} onChange={e => { const arr = [...form.newVariants]; arr[idx].stock = Number(e.target.value); setForm({...form, newVariants: arr})}} />
                             </div>
                             <button type="button" onClick={() => { const arr = [...form.newVariants]; arr.splice(idx, 1); setForm({...form, newVariants: arr})}} className="absolute top-4 right-4 text-[9px] text-red-500 font-bold uppercase hover:underline">Sil</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {editingProduct && (
                    <div className="rounded-3xl bg-stone-50 p-8 border border-stone-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">Varyant & Stok Yönetimi</p>
                       <div className="space-y-4">
                          {editingProduct.variants.map(v => (
                            <div key={v.id} className="grid grid-cols-[1fr_auto] gap-6 items-center p-6 bg-white rounded-2xl border border-stone-100">
                               <div className="space-y-1">
                                  <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest pl-1">Ürün Kodu (SKU)</p>
                                  <input 
                                    type="text"
                                    className="w-full rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-black outline-none focus:border-black transition"
                                    defaultValue={v.sku}
                                    onBlur={async (e) => {
                                      const val = e.target.value;
                                      if (val !== v.sku) {
                                        try {
                                          await updateAdminVariantRequest(v.id, { sku: val });
                                          toast.success("SKU güncellendi");
                                          loadData();
                                        } catch (err) { toast.error("SKU benzersiz olmalıdır"); }
                                      }
                                    }}
                                  />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-stone-900 uppercase tracking-widest">{v.color} {v.storage ? `/ ${v.storage}` : ''}</p>
                               </div>
                               <div className="flex flex-col gap-4">
                                  <div className="flex items-center gap-4">
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest pl-1">Eski Fiyat (₺)</p>
                                        <input 
                                          type="number"
                                          className="w-24 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-black outline-none focus:border-black transition"
                                          defaultValue={v.oldPrice || ""}
                                          placeholder="Opsiyonel"
                                          onBlur={async (e) => {
                                            const val = e.target.value === "" ? null : Number(e.target.value);
                                            if (val !== v.oldPrice) {
                                              try {
                                                await updateAdminVariantRequest(v.id, { oldPrice: val });
                                                toast.success("Eski fiyat güncellendi");
                                                loadData();
                                              } catch (err) { toast.error("Güncellenemedi"); }
                                            }
                                          }}
                                        />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest pl-1">Fiyat (₺)</p>
                                        <input 
                                          type="number"
                                          className="w-20 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-black outline-none focus:border-black transition"
                                          defaultValue={v.price}
                                          onBlur={async (e) => {
                                            const val = Number(e.target.value);
                                            if (val !== v.price) {
                                              try {
                                                await updateAdminVariantRequest(v.id, { price: val });
                                                toast.success("Satış fiyatı güncellendi");
                                                loadData();
                                              } catch (err) { toast.error("Güncellenemedi"); }
                                            }
                                          }}
                                        />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest pl-1">Bayi Fiyatı (₺)</p>
                                        <input 
                                          type="number"
                                          className="w-20 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 px-3 py-2 text-[11px] font-black outline-none focus:border-blue-500 transition"
                                          defaultValue={v.wholesalePrice || ""}
                                          placeholder="Opsiyonel"
                                          onBlur={async (e) => {
                                            const val = e.target.value === "" ? null : Number(e.target.value);
                                            if (val !== v.wholesalePrice) {
                                              try {
                                                await updateAdminVariantRequest(v.id, { wholesalePrice: val });
                                                toast.success("Bayi fiyatı güncellendi");
                                                loadData();
                                              } catch (err) { toast.error("Güncellenemedi"); }
                                            }
                                          }}
                                        />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest pl-1">Stok (Adet)</p>
                                        <input 
                                          type="number"
                                          className="w-20 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-black outline-none focus:border-black transition"
                                          defaultValue={v.stock}
                                          onBlur={async (e) => {
                                            const val = Number(e.target.value);
                                            if (val !== v.stock) {
                                              try {
                                                await updateAdminVariantRequest(v.id, { stock: val });
                                                loadData();
                                              } catch (err) { alert("Güncellenemedi"); }
                                            }
                                          }}
                                        />
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <ImageUpload 
                                       label="Varyant Görseli"
                                       onUploadSuccess={async (url) => {
                                         try {
                                           await updateAdminVariantRequest(v.id, { image: url });
                                           loadData();
                                         } catch (err) { alert("Güncellenemedi"); }
                                       }}
                                     />
                                     <input 
                                       type="text"
                                       className="w-full rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-bold outline-none focus:border-black transition"
                                       placeholder="Veya URL yapıştırın..."
                                       defaultValue={v.images?.[0]?.url || ""}
                                       onBlur={async (e) => {
                                         const val = e.target.value;
                                         if (val !== (v.images?.[0]?.url || "")) {
                                           try {
                                             await updateAdminVariantRequest(v.id, { image: val });
                                             loadData();
                                           } catch (err) { alert("Güncellenemedi"); }
                                         }
                                       }}
                                     />
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
              </div>

              <div className="p-10 border-t border-stone-100 bg-stone-50/50 flex gap-4">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 rounded-full border-2 border-stone-100 bg-white py-5 text-[11px] font-black uppercase tracking-widest text-stone-400 transition hover:border-stone-200 hover:text-stone-600 active:scale-95"
                 >
                    İptal
                 </button>
                 <button 
                   onClick={async () => {
                     try {
                       if (editingProduct) {
                         await updateAdminProductRequest(editingProduct.id, {
                           name: form.name,
                           brand: form.brand,
                           description: form.description,
                         });
                       } else {
                         await createAdminProductRequest({
                           name: form.name,
                           slug: form.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                           description: form.description,
                           brand: form.brand,
                           categoryId: form.categoryId,
                           mainImage: form.mainImage,
                           variants: form.newVariants.map(v => ({
                             sku: v.sku,
                             color: v.color,
                             storage: v.storage,
                             price: Number(v.price),
                             stock: Number(v.stock),
                             oldPrice: v.oldPrice ? Number(v.oldPrice) : null
                           })),
                         });
                       }
                       setIsModalOpen(false);
                       loadData();
                     } catch(err) {
                       alert("Hata oluştu");
                     }
                   }}
                   disabled={!form.name || !form.brand || (!editingProduct && !form.categoryId)}
                   className="flex-1 rounded-full border-2 border-black bg-stone-900 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-stone-200 transition hover:bg-black active:scale-95 disabled:opacity-50"
                 >
                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                 </button>
              </div>
            </div>
         </div>
       )}

      {/* Bulk Operations Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg overflow-hidden rounded-[3rem] border border-stone-100 bg-white shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-stone-50 p-8 border-b border-stone-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                       Hızlı / Toplu İşlemler
                    </h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Zam veya indirim uygulayın</p>
                 </div>
                 <button onClick={() => setIsBulkModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>

              <div className="flex border-b border-stone-100 bg-stone-50/50">
                <button
                  onClick={() => setBulkTab("all")}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition border-b-2 ${bulkTab === "all" ? "border-black text-black" : "border-transparent text-stone-400 hover:text-stone-600"}`}
                >
                  Tüm Ürünler
                </button>
                <button
                  onClick={() => setBulkTab("single")}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition border-b-2 ${bulkTab === "single" ? "border-black text-black" : "border-transparent text-stone-400 hover:text-stone-600"}`}
                >
                  Tekil Ürün (SKU)
                </button>
              </div>

              <div className="p-8 space-y-6">
                {bulkTab === "single" && (
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Hedef Ürün Kodu (SKU)</label>
                     <input 
                       type="text" 
                       className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                       placeholder="Örn: IPH14PRO"
                       value={bulkSku}
                       onChange={e => setBulkSku(e.target.value.toUpperCase())}
                     />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBulkAction("increase")}
                    className={`py-4 rounded-2xl border-2 transition font-black uppercase tracking-widest text-[11px] ${bulkAction === "increase" ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-white text-stone-400 hover:border-stone-200"}`}
                  >
                    Zam (Artış)
                  </button>
                  <button
                    onClick={() => setBulkAction("decrease")}
                    className={`py-4 rounded-2xl border-2 transition font-black uppercase tracking-widest text-[11px] ${bulkAction === "decrease" ? "border-red-500 bg-red-50 text-red-700" : "border-stone-100 bg-white text-stone-400 hover:border-stone-200"}`}
                  >
                    İndirim (Düşüş)
                  </button>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Yüzde Oranı (%)</label>
                   <input 
                     type="number" 
                     className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-2xl font-black text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                     placeholder="10"
                     value={bulkPercentage}
                     onChange={e => setBulkPercentage(e.target.value)}
                   />
                </div>
                
                {bulkTab === "all" && (
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-800 text-xs font-bold flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <p>Dikkat! Bu işlem mağazadaki <b>TÜM ÜRÜNLERİN</b> fiyatını <b>%{bulkPercentage || "0"}</b> oranında {bulkAction === "increase" ? "artıracaktır" : "düşürecektir"}. Geri alınamaz.</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex gap-4">
                 <button 
                   onClick={() => setIsBulkModalOpen(false)}
                   className="flex-1 rounded-full border-2 border-stone-100 bg-white py-4 text-[11px] font-black uppercase tracking-widest text-stone-400 transition hover:border-stone-200 hover:text-stone-600 active:scale-95"
                 >
                    İptal
                 </button>
                 <button 
                   onClick={async () => {
                     try {
                       if (!bulkPercentage || Number(bulkPercentage) <= 0) {
                         toast.error("Lütfen geçerli bir yüzde girin");
                         return;
                       }
                       if (bulkTab === "single" && !bulkSku) {
                         toast.error("Lütfen bir SKU kodu girin");
                         return;
                       }
                       
                       setIsBulkSubmitting(true);
                       await bulkUpdatePricesRequest({
                         action: bulkAction,
                         percentage: Number(bulkPercentage),
                         targetSku: bulkTab === "single" ? bulkSku : undefined
                       });
                       
                       toast.success("Fiyatlar başarıyla güncellendi!");
                       setIsBulkModalOpen(false);
                       loadData();
                     } catch(err: any) {
                       toast.error(err.message || "Bir hata oluştu");
                     } finally {
                       setIsBulkSubmitting(false);
                     }
                   }}
                   disabled={isBulkSubmitting || !bulkPercentage || (bulkTab === "single" && !bulkSku)}
                   className={`flex-1 rounded-full border-2 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition active:scale-95 disabled:opacity-50 ${bulkAction === "increase" ? "border-green-600 bg-green-500 shadow-green-200 hover:bg-green-600" : "border-red-600 bg-red-500 shadow-red-200 hover:bg-red-600"}`}
                 >
                    {isBulkSubmitting ? 'İşleniyor...' : (bulkAction === "increase" ? 'Zam Yap' : 'İndirim Yap')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
