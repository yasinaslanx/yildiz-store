"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Plus, Minus, Trash2, Printer, MapPin, Truck, Box } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

type Variant = {
  id: string;
  sku: string;
  color: string;
  storage: string | null;
  stock: number;
  dealerPrice: number | null;
  wholesalePrice: number | null;
  price: number;
  images: { url: string }[];
};

type Product = {
  id: string;
  name: string;
  brand: string;
  variants: Variant[];
  images: { url: string }[];
};

type Dealer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  balanceUSD: number;
};

type CartItem = {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  brand: string;
  color: string;
  storage: string | null;
  image: string | null;
  quantity: number;
  priceUSD: number; // Toptan Satış Fiyatı (Manuel düzenlenebilir)
  discountPercent: number;
  finalPriceUSD: number;
  originalPriceUSD: number;
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [deliveryType, setDeliveryType] = useState<"HAND_DELIVERY" | "SHIPPED">("HAND_DELIVERY");
  const [exchangeRate, setExchangeRate] = useState<number>(33.5); // Varsayılan Kur
  const [discountUSD, setDiscountUSD] = useState<number>(0);
  const [paidAmountUSD, setPaidAmountUSD] = useState(0);

  // Misafir Cari States
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // New Dealer Modal States
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [newDealerData, setNewDealerData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [savingDealer, setSavingDealer] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, dealersRes] = await Promise.all([
          fetch("/api/admin/products?includeVariants=true"),
          fetch("/api/admin/pos/dealers")
        ]);
        const productsData = await productsRes.json();
        const dealersData = await dealersRes.json();
        
        if (productsData.success) {
          setProducts(productsData.data);
          setFilteredProducts(productsData.data);
        }
        if (dealersData.success) setDealers(dealersData.dealers);
      } catch (error) {
        console.error("Veri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch live USD/TRY exchange rate (Sync with global header)
    fetch("https://finans.truncgil.com/today.json")
      .then(res => res.json())
      .then(data => {
        if (data.USD && data.USD.Satış) {
          const usdRate = parseFloat(data.USD.Satış.replace(",", "."));
          if (!isNaN(usdRate) && usdRate > 0) {
            setExchangeRate(usdRate);
          }
        }
      })
      .catch(console.error);

    loadData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.variants.some(v => v.sku.toLowerCase().includes(q))
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Varsayılan USD fiyatını bul (DİA tarzı toptan fiyatı baz alalım)
  const getBaseUSDPrice = (variant: Variant) => {
    const priceTRY = variant.dealerPrice || variant.wholesalePrice || variant.price;
    // Eğer fiyat zaten sistemde varsa USD'ye çevirelim (veya direkt satıcı manuel girebilir, şimdilik çeviriyoruz)
    return parseFloat((priceTRY / exchangeRate).toFixed(2));
  };

  const addToCart = (product: Product, variant: Variant) => {
    if (variant.stock <= 0) {
      toast.error("Bu varyantın stoğu yetersiz!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stock) {
          toast.error("Stok miktarını aşıyorsunuz!");
          return prev;
        }
        return prev.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      const priceUSD = getBaseUSDPrice(variant);
      return [...prev, {
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        productName: product.name,
        brand: product.brand,
        color: variant.color,
        storage: variant.storage,
        image: variant.images?.[0]?.url || product.images?.[0]?.url || null,
        quantity: 1,
        priceUSD: priceUSD,
        discountPercent: 0,
        finalPriceUSD: priceUSD,
        originalPriceUSD: priceUSD,
      }];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQ = item.quantity + delta;
        if (newQ <= 0) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const updatePrice = (variantId: string, newPrice: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const finalPrice = newPrice * (1 - item.discountPercent / 100);
        return { ...item, priceUSD: newPrice, finalPriceUSD: finalPrice };
      }
      return item;
    }));
  };

  const updateDiscount = (variantId: string, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const finalPrice = item.priceUSD * (1 - discount / 100);
        return { ...item, discountPercent: discount, finalPriceUSD: finalPrice };
      }
      return item;
    }));
  };

  const updateFinalPrice = (variantId: string, finalPrice: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const discount = item.priceUSD > 0 ? ((item.priceUSD - finalPrice) / item.priceUSD) * 100 : 0;
        return { ...item, discountPercent: discount, finalPriceUSD: finalPrice };
      }
      return item;
    }));
  };

  const applyBulkDiscount = () => {
    const discountStr = window.prompt("Tüm sepete uygulanacak % indirim oranını giriniz:", "10");
    if (discountStr !== null) {
      const discount = parseFloat(discountStr);
      if (!isNaN(discount)) {
        setCart(prev => prev.map(item => {
          const finalPrice = item.priceUSD * (1 - discount / 100);
          return { ...item, discountPercent: discount, finalPriceUSD: finalPrice };
        }));
      }
    }
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const subTotalUSD = cart.reduce((sum, item) => sum + (item.finalPriceUSD * item.quantity), 0);
  const totalUSD = Math.max(0, subTotalUSD - discountUSD);

  const handleSubmit = async (shouldPrint: boolean = true) => {
    if (cart.length === 0) return toast.error("Sepet boş.");
    if (!selectedDealer && !guestName) return toast.error("Lütfen bir cari veya misafir ismi girin.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/pos/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId: selectedDealer?.id || null,
          customerName: selectedDealer?.name || guestName,
          customerPhone: selectedDealer?.phone || guestPhone,
          customerEmail: selectedDealer?.email,
          shippingAddress: guestAddress || "Merkez Mağaza",
          items: cart,
          totalAmountUSD: totalUSD,
          discountAmountUSD: discountUSD,
          deliveryType,
          exchangeRate,
          note: `Satış Noktası - ${new Date().toLocaleDateString()}`,
          paidAmountUSD: paidAmountUSD
        })
      });

      const data = await res.json();
      if (data.success) {
        if (shouldPrint) {
          toast.success("Sipariş oluşturuldu! Fişe yönlendiriliyorsunuz...");
          window.location.href = `/admin/pos/${data.orderId}/print`;
        } else {
          toast.success("Satış başarıyla borç/açık hesap olarak kaydedildi!");
          setCart([]);
          setDiscountUSD(0);
          setSearchQuery("");
        }
      } else {
        toast.error(data.message || "Hata oluştu.");
      }
    } catch (err) {
      toast.error("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDealer(true);
    try {
      const res = await fetch("/api/admin/pos/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDealerData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cari başarıyla oluşturuldu.");
        setDealers(prev => [...prev, data.dealer].sort((a,b) => a.name.localeCompare(b.name)));
        setSelectedDealer(data.dealer);
        setIsDealerModalOpen(false);
        setNewDealerData({ firstName: "", lastName: "", email: "", phone: "" });
      } else {
        toast.error(data.message || "Hata oluştu.");
      }
    } catch (err) {
      toast.error("Kayıt sırasında hata oluştu.");
    } finally {
      setSavingDealer(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner loading-lg text-stone-900"></span></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-stone-100/50">
      
      {/* LEFT: Product Selection */}
      <div className="w-1/2 flex flex-col border-r border-stone-200 bg-white">
        {/* Header & Search */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
             <h1 className="text-2xl font-black uppercase tracking-tighter text-stone-900 italic">Toptan Satış (POS)</h1>
             <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">Hızlı Sipariş Ekranı</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200">
               <span className="text-[10px] font-black uppercase text-stone-400">USD Kur:</span>
               <input 
                 type="number" 
                 value={exchangeRate}
                 onChange={(e) => setExchangeRate(Number(e.target.value))}
                 className="w-16 outline-none font-bold text-sm text-stone-900"
               />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Barkod veya Ürün Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    const q = searchQuery.trim().toLowerCase();
                    let exactMatchVariant: Variant | null = null;
                    let exactMatchProduct: Product | null = null;
                    for (const p of products) {
                      const v = p.variants.find(v => v.sku.toLowerCase() === q);
                      if (v) {
                        exactMatchVariant = v;
                        exactMatchProduct = p;
                        break;
                      }
                    }
                    if (exactMatchVariant && exactMatchProduct) {
                      addToCart(exactMatchProduct, exactMatchVariant);
                      setSearchQuery("");
                    } else {
                      toast.error("Barkod (SKU) bulunamadı.");
                    }
                  }
                }}
                className="w-72 bg-white border-2 border-stone-100 rounded-2xl px-5 py-3 pl-12 text-sm font-bold focus:border-stone-900 outline-none transition"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl p-4 border border-stone-100 shadow-sm flex flex-col">
                <div className="w-full aspect-square relative bg-stone-50 rounded-2xl mb-4 p-2 overflow-hidden">
                  {product.images?.[0]?.url ? (
                    <Image src={product.images[0].url} alt={product.name} fill className="object-contain" />
                  ) : (
                    <Box className="w-8 h-8 m-auto text-stone-300" />
                  )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 line-clamp-1">{product.brand}</p>
                <p className="text-sm font-black text-stone-900 uppercase tracking-tight leading-tight line-clamp-2 mb-4">{product.name}</p>
                
                <div className="mt-auto space-y-2">
                  {product.variants.map(variant => (
                    <button 
                      key={variant.id}
                      onClick={() => addToCart(product, variant)}
                      disabled={variant.stock <= 0}
                      className="w-full flex items-center justify-between bg-stone-50 hover:bg-stone-100 p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed group border border-stone-100"
                    >
                      <div className="text-left">
                         <p className="text-xs font-bold text-stone-700">{variant.color} {variant.storage && ` - ${variant.storage}`}</p>
                         <p className="text-[9px] font-black uppercase text-stone-400">Stok: {variant.stock}</p>
                      </div>
                      <Plus className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-1/2 flex flex-col bg-white">
        
        {/* Customer Selection */}
        <div className="p-6 border-b border-stone-100 space-y-4 bg-stone-50/50">
           <div className="flex items-center gap-2 mb-2 justify-between">
             <div className="flex items-center gap-2">
               <User className="w-5 h-5 text-stone-400" />
               <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">Cari / Müşteri</h2>
             </div>
             <button onClick={() => setIsDealerModalOpen(true)} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black uppercase tracking-widest hover:bg-blue-100 transition">
               + Yeni Cari Ekle
             </button>
           </div>
           
           <select 
             className="w-full bg-white border-2 border-stone-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-stone-900 outline-none"
             value={selectedDealer?.id || ""}
             onChange={(e) => {
               if(e.target.value === "") setSelectedDealer(null);
               else setSelectedDealer(dealers.find(d => d.id === e.target.value) || null);
             }}
           >
             <option value="">-- Misafir Müşteri --</option>
             {dealers.map(d => (
               <option key={d.id} value={d.id}>{d.name} ({d.balanceUSD < 0 ? 'Önceden Ödenen' : 'Borç'}: {d.balanceUSD < 0 ? '-' : ''}${Math.abs(d.balanceUSD).toFixed(2)})</option>
             ))}
           </select>

           {!selectedDealer && (
             <div className="grid grid-cols-2 gap-2 mt-2">
               <input 
                 type="text" placeholder="Ad Soyad" 
                 value={guestName} onChange={e => setGuestName(e.target.value)}
                 className="bg-white border-2 border-stone-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
               />
               <input 
                 type="text" placeholder="Telefon" 
                 value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                 className="bg-white border-2 border-stone-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
               />
             </div>
           )}

           <div className="flex gap-2 p-1 bg-stone-200/50 rounded-xl mt-4">
              <button 
                onClick={() => setDeliveryType("HAND_DELIVERY")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${deliveryType === "HAND_DELIVERY" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
              >
                <MapPin className="w-4 h-4" /> Elden Teslim
              </button>
              <button 
                onClick={() => setDeliveryType("SHIPPED")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${deliveryType === "SHIPPED" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-700"}`}
              >
                <Truck className="w-4 h-4" /> Gönderim
              </button>
           </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
               <ShoppingCart className="w-16 h-16" />
               <p className="text-sm font-black uppercase tracking-widest">Sepet Boş</p>
             </div>
           ) : (
             <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
               <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 flex justify-end">
                 <button onClick={applyBulkDiscount} className="text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-3 py-1.5 rounded hover:bg-orange-200 transition">
                   Tümüne İndirim Uygula (%)
                 </button>
               </div>
               <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-stone-50 border-b border-stone-200 text-[9px] font-black uppercase tracking-widest text-stone-400 sticky top-0 z-10">
                   <tr>
                     <th className="px-2 py-3 w-24">Barkod</th>
                     <th className="px-2 py-3 min-w-[120px]">Açıklama</th>
                     <th className="px-2 py-3 text-right w-16">Miktar</th>
                     <th className="px-2 py-3 text-center w-10">Birim</th>
                     <th className="px-2 py-3 text-right w-20">L.Fiyat</th>
                     <th className="px-2 py-3 text-right w-16">İnd.%</th>
                     <th className="px-2 py-3 text-right w-20">S.Fiyat</th>
                     <th className="px-2 py-3 text-right w-20">Tutar</th>
                     <th className="px-2 py-3 w-8"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-100 text-xs font-bold text-stone-900">
                   {cart.map(item => (
                     <tr key={item.variantId} className="hover:bg-stone-50 transition group">
                       <td className="px-2 py-2 text-[10px] text-stone-500 font-medium truncate max-w-[80px]" title={item.sku}>{item.sku}</td>
                       <td className="px-2 py-2">
                         <div className="uppercase line-clamp-1 text-[10px] leading-tight">{item.brand} {item.productName}</div>
                         <div className="text-[9px] text-stone-400 mt-0.5">{item.color} {item.storage}</div>
                       </td>
                       <td className="px-2 py-2 text-right">
                         <input 
                           type="number" 
                           value={item.quantity === 0 ? "" : item.quantity}
                           onChange={(e) => updateQuantity(item.variantId, Number(e.target.value) - item.quantity)}
                           className="w-14 border border-stone-200 rounded px-1 py-1 text-right outline-none focus:border-stone-900 transition"
                         />
                       </td>
                       <td className="px-2 py-2 text-[9px] uppercase text-stone-400 text-center">Adet</td>
                       <td className="px-2 py-2 text-right">
                         <input 
                           type="number" 
                           step="0.01"
                           value={item.priceUSD === 0 ? "" : item.priceUSD}
                           onChange={(e) => updatePrice(item.variantId, Number(e.target.value))}
                           className="w-16 border border-stone-200 rounded px-1 py-1 text-right outline-none focus:border-stone-900 transition"
                         />
                       </td>
                       <td className="px-2 py-2 text-right">
                         <input 
                           type="number" 
                           step="0.1"
                           value={item.discountPercent === 0 ? "" : item.discountPercent}
                           onChange={(e) => updateDiscount(item.variantId, Number(e.target.value))}
                           className="w-12 border border-orange-200 bg-orange-50/50 rounded px-1 py-1 text-right outline-none focus:border-orange-500 transition text-orange-700"
                           placeholder="0"
                         />
                       </td>
                       <td className="px-2 py-2 text-right">
                         <input 
                           type="number" 
                           step="0.01"
                           value={item.finalPriceUSD === 0 ? "" : item.finalPriceUSD}
                           onChange={(e) => updateFinalPrice(item.variantId, Number(e.target.value))}
                           className="w-16 border border-stone-200 rounded px-1 py-1 text-right outline-none focus:border-stone-900 transition"
                         />
                       </td>
                       <td className="px-2 py-2 text-right text-stone-900 text-[11px]">${(item.finalPriceUSD * item.quantity).toFixed(2)}</td>
                       <td className="px-2 py-2 text-center">
                         <button onClick={() => removeFromCart(item.variantId)} className="text-red-400 hover:text-red-600 p-1 opacity-50 hover:opacity-100 transition">
                           <Trash2 className="w-3 h-3" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               </div>
             </div>
           )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 bg-stone-900 text-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
           <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm font-bold text-stone-400">
                 <span>Ara Toplam</span>
                 <span>${subTotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-stone-400">
                 <span>İndirim ($)</span>
                 <input 
                    type="number" 
                    value={discountUSD} 
                    onChange={e => setDiscountUSD(Number(e.target.value))}
                    className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-right outline-none text-white focus:border-white"
                 />
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-stone-800">
                 <div>
                   <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1">Genel Toplam</span>
                   {selectedDealer && (
                      <span className="block text-[10px] font-bold text-stone-400">
                        {selectedDealer.balanceUSD < 0 ? 'Önceden Ödenen' : 'Eski Borç'}: {selectedDealer.balanceUSD < 0 ? '-' : ''}${Math.abs(selectedDealer.balanceUSD).toFixed(2)}
                      </span>
                   )}
                 </div>
                 <div className="text-right">
                    <span className="text-3xl font-black italic tracking-tighter">${totalUSD.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           {/* Ödenen Tahsilat Input */}
           <div className="flex items-center justify-between mb-6 bg-stone-100 p-4 rounded-2xl">
             <span className="text-[11px] font-black uppercase tracking-[0.1em] text-stone-700">Şimdi Alınan Tahsilat (USD)</span>
             <input 
               type="number" 
               min="0"
               step="0.01"
               value={paidAmountUSD === 0 ? '' : paidAmountUSD} 
               onChange={e => setPaidAmountUSD(Number(e.target.value) || 0)}
               className="w-24 bg-white border-2 border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-right outline-none focus:border-stone-900"
               placeholder="0.00"
             />
           </div>

           <div className="flex gap-3">
             <button 
               onClick={() => handleSubmit(false)}
               disabled={submitting || cart.length === 0}
               className="flex-1 bg-stone-800 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-[0.1em] hover:bg-stone-700 transition active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
             >
               <span>Borca Yaz / Kaydet</span>
               <span className="text-[9px] text-stone-400 normal-case tracking-normal">Yazdırmadan Tamamla</span>
             </button>

             <button 
               onClick={() => handleSubmit(true)}
               disabled={submitting || cart.length === 0}
               className="flex-1 bg-white text-stone-900 py-5 rounded-3xl text-xs font-black uppercase tracking-[0.1em] hover:bg-stone-200 transition active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
             >
               <div className="flex items-center gap-2"><Printer className="w-4 h-4" /> <span>Kaydet & Yazdır</span></div>
               <span className="text-[9px] text-stone-500 normal-case tracking-normal">Fiş Ekranına Git</span>
             </button>
           </div>
        </div>

      </div>
      
      {/* NEW DEALER MODAL */}
      {isDealerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <form onSubmit={handleCreateDealer} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-stone-900">Yeni Cari Oluştur</h2>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Hızlı Müşteri Kaydı</p>
              </div>
              <button type="button" onClick={() => setIsDealerModalOpen(false)} className="text-stone-400 hover:text-stone-900 bg-white p-2 rounded-full border border-stone-200">
                <Box className="w-4 h-4" /> {/* Just close icon normally, but let's just write "Kapat" if we don't have X */}
                X
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Adı (Şirket Unvanı 1)</label>
                <input required type="text" value={newDealerData.firstName} onChange={e => setNewDealerData({...newDealerData, firstName: e.target.value})} className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 mt-1 font-bold outline-none focus:border-stone-900" placeholder="Örn: Aslan" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Soyadı (Şirket Unvanı 2)</label>
                <input required type="text" value={newDealerData.lastName} onChange={e => setNewDealerData({...newDealerData, lastName: e.target.value})} className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 mt-1 font-bold outline-none focus:border-stone-900" placeholder="Örn: İletişim" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">E-posta</label>
                <input required type="email" value={newDealerData.email} onChange={e => setNewDealerData({...newDealerData, email: e.target.value})} className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 mt-1 font-bold outline-none focus:border-stone-900" placeholder="Örn: aslan@iletisim.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Telefon (Opsiyonel)</label>
                <input type="text" value={newDealerData.phone} onChange={e => setNewDealerData({...newDealerData, phone: e.target.value})} className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 mt-1 font-bold outline-none focus:border-stone-900" placeholder="Örn: 0532 000 00 00" />
              </div>
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
              <button type="button" onClick={() => setIsDealerModalOpen(false)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-xl">İptal</button>
              <button type="submit" disabled={savingDealer} className="flex-[2] py-3 text-xs font-black uppercase tracking-widest text-white bg-stone-900 hover:bg-black rounded-xl disabled:opacity-50">
                {savingDealer ? "Kaydediliyor..." : "Kaydet ve Seç"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
