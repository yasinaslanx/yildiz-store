"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminProducts, updateAdminVariantRequest, fetchAdminCategories, deleteAdminVariantRequest } from "@/lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";

type Variant = {
  id: string;
  sku: string;
  color: string;
  storage?: string | null;
  price: number;
  buyPrice?: number;
  branchPrice?: number;
  wholesalePrice?: number;
  stock: number;
  images?: { url: string }[];
  product: {
    name: string;
    brand: string;
    category?: { name: string };
    mainImage?: string;
  };
};

export default function WarehousePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showDiaModal, setShowDiaModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | "">("");
  const [displayCurrency, setDisplayCurrency] = useState<"TL" | "USD">("TL");
  const [displayExchangeRate, setDisplayExchangeRate] = useState<number>(46.45);
  const [viewMode, setViewMode] = useState<"summary" | "low_stock" | "logs">("summary");
  const [logs, setLogs] = useState<any[]>([]);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
              category: p.category,
              mainImage: p.images?.[0]?.url
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

  const handleViewLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/warehouse/logs");
      const result = await res.json();
      if (result.success) setLogs(result.data);
      setViewMode("logs");
    } catch (err) {
      toast.error("Loglar alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const items: any[] = [];
        
        // Gelişmiş CSV Formatı: SKU;Ürün Adı;Marka;Kategori;Renk;Fiyat;Stok
        // Sütun sırasına göre okuma yapıyoruz.
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.includes(';') ? line.split(';') : line.split(',');
          if (parts.length >= 2) {
            // Eğer sadece 2 sütun varsa (eski şablon)
            if (parts.length === 2) {
              const sku = parts[0].trim();
              const stock = parseInt(parts[1].trim(), 10);
              if (sku && !isNaN(stock)) {
                items.push({ sku, stock });
              }
            } else {
              // Gelişmiş şablon (7 sütun veya daha fazla)
              const sku = parts[0]?.trim();
              const name = parts[1]?.trim();
              const brand = parts[2]?.trim();
              const category = parts[3]?.trim();
              const color = parts[4]?.trim();
              const price = parts[5]?.trim() ? parseFloat(parts[5].trim()) : undefined;
              const stock = parts[6]?.trim() ? parseInt(parts[6].trim(), 10) : 0;
              
              if (sku) {
                items.push({ sku, name, brand, category, color, price, stock });
              }
            }
          }
        }

        if (items.length === 0) {
          toast.error("Geçerli veri bulunamadı.");
          return;
        }

        const res = await fetch("/api/admin/warehouse/import-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items })
        });
        
        const result = await res.json();
        if (result.success) {
          toast.success(result.message);
          loadData(); // Verileri yenile
        } else {
          toast.error(result.message || "Güncelleme başarısız.");
        }
      } catch (err) {
        toast.error("Dosya okunurken hata oluştu.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const diaInputRef = useRef<HTMLInputElement>(null);

  const handleDiaUpload = async (event: React.ChangeEvent<HTMLInputElement> | null) => {
    const file = event?.target?.files?.[0] || diaInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Lütfen önce bir dosya seçin.");
      return;
    }

    if (!exchangeRate || Number(exchangeRate) <= 0) {
      toast.error("Lütfen geçerli bir dolar kuru girin.");
      return;
    }

    setShowDiaModal(false);
    setLoading(true);
    toast.loading(`Veriler yapay zeka ile eşleştiriliyor ve ${exchangeRate} kuruyla TL'ye çevriliyor...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exchangeRate", exchangeRate.toString());

      const res = await fetch("/api/admin/warehouse/dia-import", {
        method: "POST",
        body: formData
      });
      
      const result = await res.json();
      toast.dismiss();
      if (result.success) {
        toast.success(result.message, { duration: 10000 }); // Uzun kalsın
        loadData(); // Verileri yenile
      } else {
        toast.error(result.message || "Güncelleme başarısız.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Dosya yüklenirken kritik bir hata oluştu.");
    } finally {
      setLoading(false);
      if (diaInputRef.current) diaInputRef.current.value = ''; // Reset input
    }
  };

  const handleDownloadProducts = () => {
    window.open("/api/admin/warehouse/export-products", "_blank");
  };

  const handleUpdateStock = async (variantId: string, newStock: number) => {
    try {
      await updateAdminVariantRequest(variantId, { stock: newStock });
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock: newStock } : v));
      toast.success("Stok güncellendi");
    } catch (err) {
      toast.error("Hata oluştu");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm("Bu varyantı kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      await deleteAdminVariantRequest(variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success("Varyant silindi");
    } catch (err) {
      toast.error("Varyant silinemedi");
    }
  };

  const handleBulkExchange = async () => {
    const rateStr = window.prompt("Lütfen güncel Dolar kurunu girin (Örn: 32.50). Tüm depodaki ürün fiyatları bu rakamla çarpılarak TL'ye çevrilecektir. DİKKAT: Bu işlem geri alınamaz!");
    if (!rateStr) return;
    
    const rate = parseFloat(rateStr.replace(',', '.'));
    if (isNaN(rate) || rate <= 0) {
      toast.error("Geçersiz bir kur girdiniz.");
      return;
    }

    if (!window.confirm(`Tüm fiyatlar ${rate} ile çarpılacak. Emin misiniz?`)) return;

    toast.loading("Toplu kur çevirimi yapılıyor...");
    try {
      const res = await fetch("/api/admin/warehouse/bulk-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchangeRate: rate })
      });
      const data = await res.json();
      toast.dismiss();
      if (data.success) {
        toast.success(`Başarılı! ${data.count} varyant TL'ye çevrildi.`);
        loadData();
      } else {
        toast.error(data.message || "İşlem başarısız.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Bağlantı hatası.");
    }
  };

  const filteredVariants = variants.filter(v => 
    v.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const lowStockCount = variants.filter(v => v.stock < 5 && v.stock > 0).length;
  const outOfStockCount = variants.filter(v => v.stock === 0).length;
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Lojistik Merkezi</p>
           <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Depo Yönetimi</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleViewLogs}
             className="cursor-pointer flex items-center gap-3 rounded-full border-2 border-stone-200 bg-white px-8 py-4 text-[11px] font-black uppercase tracking-widest text-stone-900 shadow-sm transition hover:bg-stone-50 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Hareket Geçmişi
           </button>
           <button 
                onClick={handleBulkExchange}
                className="cursor-pointer flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-50 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-blue-700 shadow-sm transition hover:bg-blue-100 active:scale-95"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5 5-5-5"/><path d="m13 7 5-5 5 5"/><path d="M22 18H6"/><path d="M2 6h16"/></svg>
                 Kura Göre Çevir
              </button>
             <div className="relative group">
               <button 
                 className="cursor-pointer flex items-center gap-3 rounded-full border-2 border-emerald-200 bg-emerald-50 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-emerald-700 shadow-sm transition hover:bg-emerald-100 active:scale-95"
               >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Toplu Güncelleme
             </button>
             <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button onClick={handleDownloadProducts} className="w-full text-left px-4 py-4 text-xs font-bold text-stone-600 hover:bg-stone-50 transition border-b border-stone-50">1. Tüm Ürünleri İndir (Excel/CSV)</button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-4 text-xs font-bold text-stone-600 hover:bg-stone-50 transition border-b border-stone-50">2. Normal Excel/CSV Yükle</button>
                <button onClick={() => setShowDiaModal(true)} className="w-full text-left px-4 py-4 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-between">
                  Veri Çek / Eşitle
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
             </div>
             <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <input type="file" accept=".xls,.xlsx" className="hidden" ref={diaInputRef} onChange={(e) => {
               if (e.target.files?.length) {
                 handleDiaUpload(e);
               }
             }} />
           </div>
           <button 
             onClick={() => setShowScanner(true)}
             className="cursor-pointer flex items-center gap-3 rounded-full border-2 border-black bg-stone-900 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-stone-200 transition hover:bg-black active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/><path d="M10 9v6"/><path d="M14 9v6"/></svg>
              Kamera ile Tara
           </button>
        </div>
      </div>

      {/* View Conditional Rendering */}
      {viewMode === 'summary' ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
         <div className="rounded-[2.5rem] bg-white border border-stone-100 p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Toplam Varyant</p>
            <p className="text-4xl font-black tracking-tighter text-stone-900 italic">{variants.length}</p>
         </div>
         <div 
           onClick={() => setViewMode("low_stock")}
           className="cursor-pointer group rounded-[2.5rem] bg-red-50 border border-red-100 p-8 shadow-sm transition-all hover:bg-red-100 hover:shadow-md hover:scale-[1.02] active:scale-95"
         >
            <div className="flex justify-between items-start mb-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-red-500">Düşük Stok (&lt;5)</p>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <p className="text-4xl font-black tracking-tighter text-red-600 italic">{lowStockCount}</p>
         </div>
         <div className="rounded-[2.5rem] bg-stone-50 border border-stone-100 p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Depodaki Toplam Ürün</p>
            <p className="text-4xl font-black tracking-tighter text-stone-900 italic">{totalStock.toLocaleString()}</p>
         </div>
         <div className="rounded-[2.5rem] bg-stone-50 border border-stone-100 p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Tükenen Ürünler (Stok 0)</p>
            <p className="text-4xl font-black tracking-tighter text-stone-900 italic">{outOfStockCount}</p>
         </div>
      </div>

      {/* Search & Table */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center max-w-4xl">
         <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Ürün adı veya SKU ara..." 
              className="w-full rounded-2xl border border-stone-100 bg-white px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-stone-100">
            <span className="text-[10px] font-black uppercase text-stone-400 mr-2 ml-4">Görünüm:</span>
            <button
               onClick={() => setDisplayCurrency("TL")}
               className={`px-4 py-2 rounded-xl text-xs font-black transition ${displayCurrency === 'TL' ? 'bg-stone-900 text-white shadow-md' : 'bg-transparent text-stone-500 hover:bg-stone-50'}`}
            >
               ₺ TL
            </button>
            <button
               onClick={() => {
                 if (displayCurrency === "TL") {
                   const rate = window.prompt("Fiyatları Dolara bölebilmek için güncel dolar kurunu girin:", displayExchangeRate.toString());
                   if (rate && !isNaN(parseFloat(rate.replace(',','.')))) {
                     setDisplayExchangeRate(parseFloat(rate.replace(',','.')));
                     setDisplayCurrency("USD");
                   }
                 } else {
                   setDisplayCurrency("USD");
                 }
               }}
               className={`px-4 py-2 rounded-xl text-xs font-black transition ${displayCurrency === 'USD' ? 'bg-stone-900 text-white shadow-md' : 'bg-transparent text-stone-500 hover:bg-stone-50'}`}
            >
               $ USD
            </button>
         </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-stone-50/50 border-b border-stone-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün / SKU</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Kategori</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Fiyatlar (A/Ş/T/P)</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Mevcut Stok</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Hızlı İşlem</th>
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
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-stone-500">Alış: <span className="text-stone-900 font-black">
                             {displayCurrency === "TL" 
                                ? `${Number(v.buyPrice || 0).toLocaleString()}₺` 
                                : `$${(Number(v.buyPrice || 0) / displayExchangeRate).toFixed(2)}`}
                          </span></p>
                          <p className="text-[10px] font-bold text-stone-500">Şube: <span className="text-stone-900 font-black">
                             {displayCurrency === "TL" 
                                ? `${Number(v.branchPrice || 0).toLocaleString()}₺` 
                                : `$${(Number(v.branchPrice || 0) / displayExchangeRate).toFixed(2)}`}
                          </span></p>
                          <p className="text-[10px] font-bold text-emerald-600">Toptan: <span className="text-emerald-700 font-black">
                             {displayCurrency === "TL" 
                                ? `${Number(v.wholesalePrice || 0).toLocaleString()}₺` 
                                : `$${(Number(v.wholesalePrice || 0) / displayExchangeRate).toFixed(2)}`}
                          </span></p>
                          <p className="text-[10px] font-bold text-blue-600">Perakende: <span className="text-blue-700 font-black">
                             {displayCurrency === "TL" 
                                ? `${Number(v.price || 0).toLocaleString()}₺` 
                                : `$${(Number(v.price || 0) / displayExchangeRate).toFixed(2)}`}
                          </span></p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                             <button
                               onClick={() => handleUpdateStock(v.id, Math.max(0, v.stock - 1))}
                               className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition cursor-pointer shadow-sm"
                               title="Azalt (-1)"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                             </button>
                             <input 
                               type="number"
                               value={v.stock}
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 setVariants(prev => prev.map(variant => variant.id === v.id ? { ...variant, stock: val } : variant));
                               }}
                               onBlur={(e) => {
                                 handleUpdateStock(v.id, parseInt(e.target.value) || 0);
                               }}
                               className="w-12 h-8 text-center text-xs font-black bg-transparent border-none outline-none focus:ring-0 p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                             />
                             <button
                               onClick={() => handleUpdateStock(v.id, v.stock + 1)}
                               className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition cursor-pointer shadow-sm"
                               title="Ekle (+1)"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                             </button>
                          </div>
                          <button
                            onClick={() => handleDeleteVariant(v.id)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                            title="Varyantı Sil"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => setEditingVariant(v)}
                          className="h-10 w-10 mx-auto flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-sm"
                          title="Fiyatları Düzenle"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                     </td>
                 </tr>
               ))}
               </tbody>
            </table>
         </div>
       </>
      ) : viewMode === "low_stock" ? (
        /* Low Stock View */
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="mb-8 flex items-center gap-4">
              <button 
                onClick={() => setViewMode("summary")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-stone-100 bg-white text-stone-900 transition hover:bg-stone-50 hover:scale-105 active:scale-95"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-red-600">Düşük Stoklu Ürünler</h2>
                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Stokta 5 adetten az kalan veya tükenen ürünler</p>
              </div>
           </div>

           {variants.filter(v => v.stock < 5).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] border border-stone-100 bg-stone-50/50">
                 <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tighter text-stone-900">Harika! Stoklar Güvende.</h3>
                 <p className="text-sm font-bold text-stone-400 mt-2">Düşük stok seviyesine sahip ürün bulunmuyor.</p>
              </div>
           ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                 {variants.filter(v => v.stock < 5).map(v => (
                    <div key={v.id} className="group relative overflow-hidden rounded-[2.5rem] border border-red-100 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-red-100/50 hover:-translate-y-1">
                       <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-600">
                             {v.stock === 0 ? "Tükendi" : `Son ${v.stock} Ürün`}
                          </span>
                       </div>
                       
                       <div className="h-48 w-full bg-stone-50 p-6 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={v.images?.[0]?.url || v.product.mainImage || "https://placehold.co/200"} 
                            alt={v.product.name}
                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                       </div>

                       <div className="p-8">
                          <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">{v.product.category?.name || "Genel"}</p>
                          <h3 className="text-lg font-black text-stone-900 uppercase tracking-tighter line-clamp-1">{v.product.name}</h3>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1 mb-4">{v.sku} - {v.color} {v.storage ? `/ ${v.storage}` : ''}</p>
                          
                          <div className="flex items-end justify-between border-t border-stone-50 pt-4 mt-6">
                             <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-stone-400">Satış Fiyatı</p>
                                <p className="text-lg font-black italic text-stone-900 mt-1">{v.price.toLocaleString()} ₺</p>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                                   <button
                                     onClick={() => handleUpdateStock(v.id, Math.max(0, v.stock - 1))}
                                     className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition cursor-pointer shadow-sm"
                                     title="Azalt (-1)"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                                   </button>
                                   <input 
                                     type="number"
                                     value={v.stock}
                                     onChange={(e) => {
                                       const val = parseInt(e.target.value) || 0;
                                       setVariants(prev => prev.map(variant => variant.id === v.id ? { ...variant, stock: val } : variant));
                                     }}
                                     onBlur={(e) => {
                                       handleUpdateStock(v.id, parseInt(e.target.value) || 0);
                                     }}
                                     className="w-12 h-8 text-center text-xs font-black bg-transparent border-none outline-none focus:ring-0 p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                   />
                                   <button
                                     onClick={() => handleUpdateStock(v.id, v.stock + 1)}
                                     className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition cursor-pointer shadow-sm"
                                     title="Ekle (+1)"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                   </button>
                                </div>
                                <button
                                  onClick={() => handleDeleteVariant(v.id)}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                  title="Varyantı Sil"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      ) : viewMode === "logs" ? (
        /* Logs View */
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="mb-8 flex items-center gap-4">
              <button 
                onClick={() => setViewMode("summary")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-stone-100 bg-white text-stone-900 transition hover:bg-stone-50 hover:scale-105 active:scale-95"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-stone-900">Hareket Geçmişi</h2>
                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Son stok giriş ve çıkışları</p>
              </div>
           </div>

           <div className="overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-stone-50/50 border-b border-stone-100">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Ürün / SKU</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Değişim</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Açıklama</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">İşlemi Yapan</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-stone-400">Tarih</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                   {logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Henüz hiçbir stok hareketi kaydedilmemiş.</p>
                        </td>
                      </tr>
                   ) : logs.map((log) => (
                      <tr key={log.id} className="group hover:bg-stone-50/30 transition-colors">
                         <td className="px-8 py-6">
                            <p className="text-sm font-black text-stone-900">{log.variant.product.name}</p>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">{log.variant.sku}</p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-bold text-stone-400">{log.previousStock}</span>
                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                               <span className="text-sm font-black text-stone-900">{log.newStock}</span>
                               <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${log.change > 0 ? 'bg-green-50 text-green-600' : log.change < 0 ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                                 {log.change > 0 ? `+${log.change}` : log.change}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-bold text-stone-500">{log.reason || "-"}</span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-bold text-stone-900">{log.user ? `${log.user.firstName} ${log.user.lastName}` : "Sistem"}</span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{new Date(log.createdAt).toLocaleString()}</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : null}

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
       {/* Import Modal */}
       {showDiaModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-[3rem] bg-white p-8 shadow-2xl relative animate-in zoom-in-95 duration-500">
               <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-2">Veri Çek / Eşitle</h3>
                  <p className="text-sm font-medium text-stone-500 mb-8">Sistemden aldığınız excel (.xls) dosyasını seçin ve güncel dolar kurunu girin. Eğer fiyatlar TL ise kuru 1 olarak bırakabilirsiniz.</p>
                  
                  <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Güncel Dolar Kuru (Örn: 32.50)</label>
                       <input 
                         type="number" 
                         step="0.01"
                         value={exchangeRate}
                         onChange={(e) => setExchangeRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                         placeholder="1 veya 32.50"
                         className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                       />
                       <p className="text-xs text-stone-400 mt-2">Dolar fiyatlarını TL'ye çevirmek için kullanılır.</p>
                    </div>
                  </div>
               </div>
               <div className="bg-stone-50 px-8 py-4 flex gap-3 justify-end border-t border-stone-100">
                  <button 
                    onClick={() => setShowDiaModal(false)}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-200 transition"
                  >
                     İptal
                  </button>
                  <button 
                    onClick={() => diaInputRef.current?.click()}
                    disabled={exchangeRate === "" || exchangeRate <= 0}
                    className="px-6 py-3 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition shadow-md disabled:opacity-50"
                  >
                     Dosya Seç ve Başlat
                  </button>
               </div>
            </div>
         </div>
       )}

       {/* Quick Edit Modal */}
       {editingVariant && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-[3rem] bg-white p-8 shadow-2xl relative animate-in zoom-in-95 duration-500">
               <h3 className="text-xl font-black text-stone-900 mb-2">Hızlı Fiyat Düzenle</h3>
               <p className="text-sm font-medium text-stone-500 mb-6">{editingVariant.product.name} ({editingVariant.sku})</p>
               
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 setIsEditing(true);
                 try {
                   const formData = new FormData(e.currentTarget);
                   const payload = {
                     buyPrice: parseFloat(formData.get("buyPrice") as string) || 0,
                     branchPrice: parseFloat(formData.get("branchPrice") as string) || 0,
                     wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
                     retailPrice: parseFloat(formData.get("price") as string) || 0,
                     price: parseFloat(formData.get("price") as string) || 0,
                   };
                   const res = await fetch(`/api/admin/variants/${editingVariant.id}`, {
                     method: "PATCH",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(payload)
                   });
                   const json = await res.json();
                   if (!json.success) throw new Error(json.message);
                   
                   toast.success("Fiyatlar güncellendi!");
                   setVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...v, ...payload } : v));
                   setEditingVariant(null);
                 } catch (err: any) {
                   toast.error(err.message || "Bir hata oluştu");
                 } finally {
                   setIsEditing(false);
                 }
               }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-stone-400 mb-1 block">Alış Fiyatı (₺)</label>
                        <input name="buyPrice" type="number" step="0.01" defaultValue={editingVariant.buyPrice} className="w-full rounded-xl border border-stone-200 p-3 text-sm font-bold text-stone-900 focus:border-stone-900 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-stone-400 mb-1 block">Şube Fiyatı (₺)</label>
                        <input name="branchPrice" type="number" step="0.01" defaultValue={editingVariant.branchPrice} className="w-full rounded-xl border border-stone-200 p-3 text-sm font-bold text-stone-900 focus:border-stone-900 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-stone-400 mb-1 block">Toptan Fiyatı (₺)</label>
                        <input name="wholesalePrice" type="number" step="0.01" defaultValue={editingVariant.wholesalePrice} className="w-full rounded-xl border border-stone-200 p-3 text-sm font-bold text-stone-900 focus:border-stone-900 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-stone-400 mb-1 block">Perakende / Normal (₺)</label>
                        <input name="price" type="number" step="0.01" defaultValue={editingVariant.price} className="w-full rounded-xl border border-stone-200 p-3 text-sm font-bold text-stone-900 focus:border-stone-900 outline-none transition" />
                     </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setEditingVariant(null)} className="flex-1 rounded-xl bg-stone-100 p-4 text-xs font-black uppercase tracking-widest text-stone-500 hover:bg-stone-200 transition active:scale-95">İptal</button>
                     <button type="submit" disabled={isEditing} className="flex-1 rounded-xl bg-stone-900 p-4 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-stone-800 transition active:scale-95 disabled:opacity-50">
                        {isEditing ? "Kaydediliyor..." : "Kaydet"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}

    </div>
  );
}
