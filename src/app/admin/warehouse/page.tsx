"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminProducts, updateAdminVariantRequest, fetchAdminCategories } from "@/lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";

type Variant = {
  id: string;
  sku: string;
  color: string;
  storage?: string | null;
  price: number;
  stock: number;
  product: {
    name: string;
    brand: string;
    category?: { name: string };
  };
};

export default function WarehousePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);

      // Flatten variants for easier management
      const allVariants: Variant[] = [];
      productsData.forEach((p: any) => {
        p.variants.forEach((v: any) => {
          allVariants.push({
            ...v,
            product: {
              name: p.name,
              brand: p.brand,
              category: p.category
            }
          });
        });
      });
      setVariants(allVariants);
    } catch (err) {
      toast.error("Veriler alınamadı");
    } finally {
      setLoading(false);
    }
  }

  // Scanner Logic
  useEffect(() => {
    if (showScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          setSearchQuery(decodedText);
          setShowScanner(false);
          scannerRef.current?.clear();
          toast.success(`Ürün Bulundu: ${decodedText}`);
        },
        (error) => {
          // ignore errors
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [showScanner]);

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    try {
      await updateAdminVariantRequest(variantId, { stock: newStock });
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock: newStock } : v));
      toast.success("Stok güncellendi");
    } catch (err) {
      toast.error("Hata oluştu");
    }
  };

  const filteredVariants = variants.filter(v => 
    v.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const lowStockCount = variants.filter(v => v.stock < 5).length;
  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: variants.filter(v => v.product.category?.name === cat.name).reduce((acc, v) => acc + v.stock, 0)
  }));

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Lojistik Merkezi</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Depo Yönetimi</h1>
        </div>
        <button 
          onClick={() => setShowScanner(true)}
          className="cursor-pointer flex items-center gap-3 rounded-full border-2 border-black bg-stone-900 px-10 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-stone-200 transition hover:bg-black active:scale-95"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/><path d="M10 9v6"/><path d="M14 9v6"/></svg>
           Kamera ile Tara
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
         <div className="rounded-[2.5rem] bg-white border border-stone-100 p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Toplam Varyant</p>
            <p className="text-4xl font-black tracking-tighter text-stone-900 italic">{variants.length}</p>
         </div>
         <div className="rounded-[2.5rem] bg-red-50 border border-red-100 p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Düşük Stok (&lt;5)</p>
            <p className="text-4xl font-black tracking-tighter text-red-600 italic">{lowStockCount}</p>
         </div>
         {categoryStats.slice(0, 2).map(stat => (
           <div key={stat.name} className="rounded-[2.5rem] bg-stone-50 border border-stone-100 p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">{stat.name}</p>
              <p className="text-4xl font-black tracking-tighter text-stone-900 italic">{stat.count}</p>
           </div>
         ))}
      </div>

      {/* Search & Table */}
      <div className="mb-8 max-w-xl flex gap-4">
         <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Ürün adı veya SKU ara..." 
              className="w-full rounded-2xl border border-stone-100 bg-white px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün / SKU</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Kategori</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Mevcut Stok</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Hızlı İşlem</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
               {filteredVariants.map((v) => (
                 <tr key={v.id} className={`group hover:bg-stone-50/30 transition-colors ${v.stock < 5 ? 'bg-red-50/20' : ''}`}>
                    <td className="px-8 py-6">
                       <div>
                          <p className="text-sm font-black text-stone-900">{v.product.name}</p>
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">{v.sku} - {v.color} {v.storage ? `/ ${v.storage}` : ''}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                          {v.product.category?.name || "Genel"}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`text-xl font-black italic tracking-tighter ${v.stock < 5 ? 'text-red-600' : 'text-stone-900'}`}>
                          {v.stock}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateStock(v.id, Math.max(0, v.stock - 1))}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-900 hover:bg-stone-900 hover:text-white transition cursor-pointer"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                          </button>
                          <input 
                            type="number"
                            className="w-20 rounded-xl border border-stone-100 bg-white px-3 py-2 text-center text-sm font-black outline-none focus:border-black transition"
                            value={v.stock}
                            onChange={(e) => handleUpdateStock(v.id, Number(e.target.value))}
                          />
                          <button 
                            onClick={() => handleUpdateStock(v.id, v.stock + 1)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-900 hover:bg-stone-900 hover:text-white transition cursor-pointer"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-md overflow-hidden rounded-[3.5rem] bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter italic">Barkod Tarayıcı</h2>
                 <button onClick={() => setShowScanner(false)} className="cursor-pointer text-stone-400 hover:text-stone-900 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
              </div>
              <div id="reader" className="overflow-hidden rounded-3xl border-4 border-stone-100" />
              <p className="mt-8 text-center text-xs font-bold text-stone-400 uppercase tracking-widest leading-relaxed px-8">
                 Ürünün üzerindeki barkodu veya QR kodu kameraya gösterin.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
