"use client";

import { useEffect, useState } from "react";
import { Check, X, Building2, Phone, FileText, UserCircle, Tag, Plus, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

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

type DealerOffer = {
  id: string;
  productId: string;
  minQuantity: number;
  specialPrice: number;
  active: boolean;
  title: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
    variants?: { wholesalePrice: number | null, price: number }[];
  };
};

type ProductSearch = {
  id: string;
  name: string;
  images: { url: string }[];
  variants?: { wholesalePrice: number | null, price: number }[];
};

export default function AdminDealersPage() {
  const [mainTab, setMainTab] = useState<"APPLICATIONS" | "OFFERS">("APPLICATIONS");

  // Application States
  const [applications, setApplications] = useState<DealerApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0, ALL: 0 });

  // Offer States
  const [offers, setOffers] = useState<DealerOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DealerOffer | null>(null);

  // Form States for Offer
  const [offerProduct, setOfferProduct] = useState<ProductSearch | null>(null);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerMinQty, setOfferMinQty] = useState(100);
  const [offerPrice, setOfferPrice] = useState(0);

  // Product Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (mainTab === "APPLICATIONS") {
      fetchCounts();
      fetchApplications();
    } else {
      fetchOffers();
    }
  }, [mainTab, filter]);

  // --- Applications Logic ---
  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/admin/dealers/applications/counts");
      const json = await res.json();
      if (json.success) setCounts(json.data);
    } catch (err) {
      console.error("Counts error:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
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
      setLoadingApps(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Bu başvuruyu ${status === "APPROVED" ? "onaylamak" : "reddetmek"} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/dealers/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      
      if (json.success) {
        fetchApplications();
        fetchCounts();
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert("Durum güncellenirken bir hata oluştu.");
    }
  };

  // --- Offers Logic ---
  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const res = await fetch("/api/admin/dealer-offers");
      const json = await res.json();
      if (json.success) setOffers(json.data);
    } catch (err) {
      toast.error("Teklifler yüklenemedi");
    } finally {
      setLoadingOffers(false);
    }
  };

  const searchProducts = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) setSearchResults(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveOffer = async () => {
    if (!offerProduct) return toast.error("Lütfen bir ürün seçin");
    if (offerMinQty < 1) return toast.error("Geçerli bir adet girin");
    if (offerPrice <= 0) return toast.error("Geçerli bir fiyat girin");

    try {
      const url = editingOffer ? `/api/admin/dealer-offers/${editingOffer.id}` : "/api/admin/dealer-offers";
      const method = editingOffer ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: offerProduct.id,
          minQuantity: offerMinQty,
          specialPrice: offerPrice,
          title: offerTitle || null
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingOffer ? "Teklif güncellendi" : "Yeni teklif eklendi");
        setIsOfferModalOpen(false);
        fetchOffers();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Bir hata oluştu");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/dealer-offers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Teklif silindi");
        fetchOffers();
      }
    } catch (err) {
      toast.error("Silinemedi");
    }
  };

  const toggleOfferStatus = async (offer: DealerOffer) => {
    try {
      const res = await fetch(`/api/admin/dealer-offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !offer.active })
      });
      if (res.ok) fetchOffers();
    } catch (error) {
      console.error(error);
    }
  };

  const openNewOfferModal = () => {
    setEditingOffer(null);
    setOfferProduct(null);
    setSearchQuery("");
    setSearchResults([]);
    setOfferTitle("");
    setOfferMinQty(100);
    setOfferPrice(0);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Yönetim Paneli</p>
          <h1 className="mt-2 text-4xl font-black tracking-tighter text-stone-900 uppercase">Bayi Yönetimi</h1>
        </div>

        {/* Main Tabs */}
        <div className="flex bg-stone-100 p-1.5 rounded-full">
          <button
            onClick={() => setMainTab("APPLICATIONS")}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              mainTab === "APPLICATIONS" ? "bg-white text-black shadow-md" : "text-stone-400 hover:text-stone-900"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Başvurular
          </button>
          <button
            onClick={() => setMainTab("OFFERS")}
            className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              mainTab === "OFFERS" ? "bg-white text-black shadow-md" : "text-stone-400 hover:text-stone-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            Özel Teklifler
          </button>
        </div>
      </div>

      {mainTab === "APPLICATIONS" && (
        <div className="space-y-8">
          <div className="flex bg-white rounded-full p-1 border border-stone-100 shadow-sm w-max">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  filter === status ? "bg-stone-900 text-white shadow-md" : "text-stone-400 hover:text-stone-900"
                }`}
              >
                <span>{status === "PENDING" ? "Bekleyen" : status === "APPROVED" ? "Onaylanan" : status === "REJECTED" ? "Reddedilen" : "Tümü"}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === status ? "bg-white/20" : "bg-stone-100 text-stone-500"}`}>
                  {counts[status as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          {error && <div className="p-6 bg-red-50 text-red-600 rounded-3xl font-bold text-center">{error}</div>}

          {loadingApps ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-stone-100 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-stone-100">
              <p className="text-stone-400 font-bold uppercase tracking-widest">Bu kategoride başvuru bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-lg shadow-stone-200/20 flex flex-col">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                    <div className="h-12 w-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">{app.companyName}</h3>
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
                        <button onClick={() => handleUpdateStatus(app.id, "APPROVED")} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-green-50 text-green-600 font-black uppercase tracking-widest text-[10px]">
                          <Check className="w-4 h-4" /> Onayla
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, "REJECTED")} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px]">
                          <X className="w-4 h-4" /> Reddet
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-between gap-2 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-4 ${app.status === "APPROVED" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100 justify-center"}`}>
                        {app.status === "APPROVED" ? (
                          <>
                            <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Onaylandı</div>
                            <button onClick={() => handleUpdateStatus(app.id, "REJECTED")} className="text-red-500 hover:bg-red-50 bg-white px-3 py-1.5 rounded-xl border border-red-100">İptal Et</button>
                          </>
                        ) : (<><X className="w-4 h-4" /> Reddedildi</>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mainTab === "OFFERS" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter text-stone-900">Aktif Teklifler</h2>
            <button 
              onClick={openNewOfferModal}
              className="px-6 py-3 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Yeni Teklif Ekle
            </button>
          </div>

          {loadingOffers ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-stone-100 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : offers.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-stone-100">
              <p className="text-stone-400 font-bold uppercase tracking-widest">Henüz bir bayi özel teklifi oluşturmadınız.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => {
                const basePrice = offer.product.variants?.[0]?.wholesalePrice || offer.product.variants?.[0]?.price || 0;
                const isDiscounted = basePrice > offer.specialPrice;
                const discountPercent = isDiscounted ? Math.round(((basePrice - offer.specialPrice) / basePrice) * 100) : 0;
                
                return (
                <div key={offer.id} className={`bg-white rounded-[2.5rem] p-8 border ${offer.active ? "border-blue-100 shadow-lg shadow-blue-500/5" : "border-stone-100 opacity-60"} relative overflow-hidden transition-all`}>
                  {/* Decorative corner */}
                  {offer.active && <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500 rounded-full opacity-10" />}
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
                      {offer.product.images[0] ? (
                        <img src={offer.product.images[0].url} alt={offer.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300"><Tag className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div>
                      {offer.title && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{offer.title}</p>}
                      <h3 className="font-bold text-stone-900 leading-tight line-clamp-2">{offer.product.name}</h3>
                      {isDiscounted && (
                        <p className="text-[9px] font-black text-red-500 bg-red-50 w-max px-1.5 py-0.5 rounded mt-1">%{discountPercent} İNDİRİM</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Şart</p>
                      <p className="font-bold text-stone-900">{offer.minQuantity} Adet ve Üzeri</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Birim Fiyatı</p>
                      <div className="flex items-end gap-1.5 flex-col">
                        {isDiscounted && (
                          <span className="text-[10px] line-through text-stone-400 font-bold decoration-red-500/50">{Number(basePrice).toLocaleString("tr-TR")} TL</span>
                        )}
                        <p className="font-black text-blue-600 text-lg leading-none">{Number(offer.specialPrice).toLocaleString("tr-TR")} TL</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleOfferStatus(offer)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${offer.active ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                    >
                      {offer.active ? "Pasif Yap" : "Aktif Yap"}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingOffer(offer);
                        setOfferProduct(offer.product);
                        setOfferTitle(offer.title || "");
                        setOfferMinQty(offer.minQuantity);
                        setOfferPrice(Number(offer.specialPrice));
                        setIsOfferModalOpen(true);
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Offer Create/Edit Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-stone-900">{editingOffer ? "Teklifi Düzenle" : "Yeni Bayi Teklifi"}</h2>
                <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-widest">Toplu Alım Fiyatlandırması</p>
              </div>
              <button onClick={() => setIsOfferModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full border-2 border-stone-100 text-stone-400 hover:text-stone-900 hover:border-stone-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              {/* Product Selection */}
              {!editingOffer && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Ürün Seçimi</label>
                  {!offerProduct ? (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => searchProducts(e.target.value)}
                        placeholder="Ürün adı veya kodu ile ara..."
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-10 max-h-60 overflow-y-auto">
                          {searchResults.map(p => (
                            <button 
                              key={p.id}
                              onClick={() => {
                                setOfferProduct(p);
                                setSearchResults([]);
                                setSearchQuery("");
                              }}
                              className="w-full flex items-center gap-4 p-4 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                {p.images[0] && <img src={p.images[0].url} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-bold text-sm text-stone-700 line-clamp-1">{p.name}</span>
                                {p.variants?.[0] && (
                                  <span className="text-[10px] font-bold text-stone-400">
                                    Normal Fiyat: {Number(p.variants[0].wholesalePrice || p.variants[0].price).toLocaleString("tr-TR")} TL
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-blue-100">
                          {offerProduct.images[0] && <img src={offerProduct.images[0].url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-bold text-sm text-blue-900 line-clamp-1">{offerProduct.name}</span>
                          {offerProduct.variants?.[0] && (
                            <div className="text-[10px] font-bold text-blue-600 mt-0.5">
                              Normal Bayi Fiyatı: <span className="line-through opacity-70">{Number(offerProduct.variants[0].wholesalePrice || offerProduct.variants[0].price).toLocaleString("tr-TR")} TL</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setOfferProduct(null)} className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white rounded-lg">Değiştir</button>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Duyuru Başlığı (Opsiyonel)</label>
                <input 
                  type="text" 
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Örn: 100 Adet Kırılmaz Alana Büyük İndirim!"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Price & Quantity Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">En Az Alım Adedi</label>
                  <input 
                    type="number" 
                    min="1"
                    value={offerMinQty}
                    onChange={(e) => setOfferMinQty(parseInt(e.target.value))}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-6 py-4 text-lg font-black text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Yeni Birim Fiyatı (TL)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={offerPrice || ""}
                    onChange={(e) => setOfferPrice(parseFloat(e.target.value))}
                    placeholder="500"
                    className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-lg font-black text-blue-600 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {offerMinQty > 0 && offerPrice > 0 && offerProduct && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-xs font-bold">
                  Bayi bu üründen sepete <b>{offerMinQty} adet</b> veya daha fazla eklediğinde, ürünün birim fiyatı otomatik olarak <b>{offerPrice.toLocaleString("tr-TR")} TL</b> üzerinden hesaplanacaktır.
                </div>
              )}
            </div>

            <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex gap-4 mt-auto">
              <button 
                onClick={() => setIsOfferModalOpen(false)}
                className="flex-1 rounded-full border-2 border-stone-100 bg-white py-4 text-[11px] font-black uppercase tracking-widest text-stone-400 transition hover:border-stone-200 hover:text-stone-600"
              >
                İptal
              </button>
              <button 
                onClick={handleSaveOffer}
                className="flex-[2] rounded-full bg-blue-600 py-4 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              >
                {editingOffer ? "Değişiklikleri Kaydet" : "Teklifi Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
