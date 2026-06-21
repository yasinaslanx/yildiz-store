"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

type CustomerOffer = {
  id: string;
  productId: string;
  specialPrice: number;
  active: boolean;
  title: string | null;
  createdAt: string;
  product: {
    name: string;
    slug: string;
  };
};

type ProductSearch = {
  id: string;
  name: string;
  images: { url: string }[];
  variants?: { retailPrice: number | null, price: number }[];
};

export default function AdminCustomerOffersPage() {
  const [offers, setOffers] = useState<CustomerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CustomerOffer | null>(null);

  // Form States
  const [offerProduct, setOfferProduct] = useState<ProductSearch | null>(null);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerPrice, setOfferPrice] = useState(0);
  const [active, setActive] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customer-offers");
      const json = await res.json();
      if (json.success) setOffers(json.data);
    } catch (err) {
      console.error(err);
      toast.error("Teklifler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
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
    if (!offerProduct && !editingOffer) {
      return toast.error("Lütfen bir ürün seçin");
    }
    if (offerPrice <= 0) {
      return toast.error("Geçerli bir fiyat girin");
    }

    try {
      const url = editingOffer 
        ? `/api/admin/customer-offers/${editingOffer.id}`
        : "/api/admin/customer-offers";
      
      const method = editingOffer ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: offerProduct?.id || editingOffer?.productId,
          specialPrice: offerPrice,
          active,
          title: offerTitle || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Teklif kaydedildi");
        fetchOffers();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(json.message || "Hata oluştu");
      }
    } catch (error) {
      toast.error("Sunucu hatası");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Bu teklifi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/customer-offers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Teklif silindi");
        fetchOffers();
      }
    } catch (error) {
      toast.error("Hata oluştu");
    }
  };

  const resetForm = () => {
    setOfferProduct(null);
    setOfferTitle("");
    setOfferPrice(0);
    setActive(true);
    setEditingOffer(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Müşteri Teklifleri</h1>
          <p className="text-sm text-stone-500">Normal müşteriler için ana sayfa fırsat banner'ını yönetin</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition"
        >
          <Plus className="w-4 h-4" />
          Yeni Teklif Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Yükleniyor...</div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <Tag className="w-12 h-12 text-stone-200 mb-3" />
            <p className="text-stone-500">Henüz müşteri teklifi bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Ürün</th>
                  <th className="px-6 py-4">Başlık</th>
                  <th className="px-6 py-4">Özel Fiyat</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4 font-medium text-stone-900">{offer.product.name}</td>
                    <td className="px-6 py-4 text-stone-500">{offer.title || "-"}</td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {Number(offer.specialPrice).toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700'}`}>
                        {offer.active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setOfferTitle(offer.title || "");
                          setOfferPrice(Number(offer.specialPrice));
                          setActive(offer.active);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-stone-400 hover:text-blue-600 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {editingOffer ? "Teklifi Düzenle" : "Yeni Müşteri Teklifi"}
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {!editingOffer && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Ürün Ara (Min 3 Harf)</label>
                  {!offerProduct ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Örn: Sunproof Lens..."
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {searchResults.map(p => {
                            const basePrice = p.variants?.[0]?.retailPrice || p.variants?.[0]?.price || 0;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setOfferProduct(p);
                                  setOfferPrice(Number(basePrice) * 0.9);
                                  setSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-stone-50 border-b border-stone-50 last:border-0"
                              >
                                <div className="font-medium text-stone-900">{p.name}</div>
                                <div className="text-xs text-stone-500">Normal Fiyat: {Number(basePrice).toLocaleString()} TL</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="font-medium text-blue-900">{offerProduct.name}</span>
                      <button onClick={() => setOfferProduct(null)} className="text-blue-500 hover:text-blue-700 text-sm">Değiştir</button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Banner Başlığı (Opsiyonel)</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Örn: Günün Fırsatı!, Hafta Sonu İndirimi..."
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">İndirimli Fiyat (TL)</label>
                <input
                  type="number"
                  value={offerPrice || ""}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-stone-700">Aktif (Banner'da gösterilsin mi?)</label>
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-4 py-2 text-stone-600 font-medium hover:text-stone-900"
              >
                İptal
              </button>
              <button
                onClick={handleSaveOffer}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
