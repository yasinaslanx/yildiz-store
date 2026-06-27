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
  productName: string;
  brand: string;
  color: string;
  storage: string | null;
  image: string | null;
  quantity: number;
  priceUSD: number; // Toptan Satış Fiyatı (Manuel düzenlenebilir)
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

  // Misafir Cari States
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, dealerRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/pos/dealers")
        ]);
        
        const prodData = await prodRes.json();
        const dealerData = await dealerRes.json();

        if (prodData.success) {
          setProducts(prodData.data);
          setFilteredProducts(prodData.data);
        }
        if (dealerData.success) {
          setDealers(dealerData.dealers);
        }
      } catch (error) {
        toast.error("Veriler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
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
        productName: product.name,
        brand: product.brand,
        color: variant.color,
        storage: variant.storage,
        image: variant.images?.[0]?.url || product.images?.[0]?.url || null,
        quantity: 1,
        priceUSD: priceUSD,
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
        return { ...item, priceUSD: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const subTotalUSD = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
  const totalUSD = Math.max(0, subTotalUSD - discountUSD);

  const handleSubmit = async () => {
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
          note: `Satış Noktası - ${new Date().toLocaleDateString()}`
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Sipariş başarıyla oluşturuldu! Fişe yönlendiriliyorsunuz...");
        // Fatura Print sayfasına yönlendir
        window.location.href = `/admin/pos/${data.orderId}/print`;
      } else {
        toast.error(data.message || "Hata oluştu.");
      }
    } catch (err) {
      toast.error("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><span className="loading loading-spinner loading-lg text-stone-900"></span></div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-stone-100/50">
      
      {/* LEFT: Product Selection */}
      <div className="w-2/3 flex flex-col border-r border-stone-200 bg-white">
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
      <div className="w-1/3 flex flex-col bg-white">
        
        {/* Customer Selection */}
        <div className="p-6 border-b border-stone-100 space-y-4 bg-stone-50/50">
           <div className="flex items-center gap-2 mb-2">
             <User className="w-5 h-5 text-stone-400" />
             <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">Cari / Müşteri</h2>
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
               <option key={d.id} value={d.id}>{d.name} (Bakiye: ${d.balanceUSD.toFixed(2)})</option>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
               <ShoppingCart className="w-16 h-16" />
               <p className="text-sm font-black uppercase tracking-widest">Sepet Boş</p>
             </div>
           ) : (
             cart.map(item => (
               <div key={item.variantId} className="bg-stone-50 rounded-2xl p-3 border border-stone-100 flex items-center gap-3 relative">
                  <button onClick={() => removeFromCart(item.variantId)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="w-12 h-12 bg-white rounded-xl border border-stone-100 relative overflow-hidden flex-shrink-0">
                    {item.image && <Image src={item.image} alt={item.productName} fill className="object-contain p-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-stone-900 uppercase truncate">{item.productName}</p>
                    <p className="text-[10px] font-bold text-stone-500">{item.color} {item.storage}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="flex items-center bg-white border border-stone-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.variantId, -1)} className="px-2 py-1 text-stone-400 hover:text-stone-900"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-black px-2">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, 1)} className="px-2 py-1 text-stone-400 hover:text-stone-900"><Plus className="w-3 h-3" /></button>
                       </div>
                       <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-stone-400">$</span>
                          <input 
                            type="number" 
                            value={item.priceUSD} 
                            onChange={(e) => updatePrice(item.variantId, Number(e.target.value))}
                            className="w-14 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-black outline-none focus:border-stone-900"
                          />
                       </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                     <p className="text-sm font-black text-stone-900">${(item.priceUSD * item.quantity).toFixed(2)}</p>
                  </div>
               </div>
             ))
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
                       Eski Bakiye: ${selectedDealer.balanceUSD.toFixed(2)}
                     </span>
                   )}
                 </div>
                 <div className="text-right">
                    <span className="text-3xl font-black italic tracking-tighter">${totalUSD.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleSubmit}
             disabled={submitting || cart.length === 0}
             className="w-full bg-white text-stone-900 py-5 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-stone-200 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
           >
             <Printer className="w-5 h-5" /> 
             {submitting ? "Oluşturuluyor..." : "Siparişi Tamamla & Yazdır"}
           </button>
        </div>

      </div>
    </div>
  );
}
