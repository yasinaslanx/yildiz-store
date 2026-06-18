"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/store/cart-store";
import { useUi } from "@/store/ui-store";
import { ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { useFavorites } from "@/store/favorites-store";
import { Modal } from "@/components/ui/modal";
import { Product } from "@/data/products";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";

type QuickViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
};

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { openCart } = useUi();
  const { toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();
  const { user } = useAuth();

  const colors = useMemo(() => Array.from(new Set(product.variants?.map((v: any) => v.color))), [product.variants]);
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");

  const storageOptions = useMemo(() => {
    if (!product.variants) return [];
    const options = product.variants
      .filter((v: any) => v.color === selectedColor && v.storage)
      .map((v: any) => v.storage!);
    return Array.from(new Set(options));
  }, [product.variants, selectedColor]);

  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] || "");

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return {
        id: "default-variant",
        sku: "N/A",
        color: "",
        storage: "",
        price: product.price || 0,
        stock: 0,
        active: true,
        images: product.image ? [{ url: product.image }] : [],
      };
    }
    return product.variants.find(
      (variant: any) =>
        variant.color === selectedColor &&
        (variant.storage ?? "") === selectedStorage,
    ) || product.variants[0];
  }, [product.variants, selectedColor, selectedStorage, product]);

  const favorite = isFavorite(selectedVariant.id);
  const imageObj = selectedVariant?.images?.[0];
  const displayImage = (typeof imageObj === 'string' ? imageObj : imageObj?.url) || product.image || "https://placehold.co/600x600/f5f5f4/a8a29e?text=Gorsel+Yok";

  const isDealer = user?.role === "DEALER" || user?.role === "dealer";
  const finalPrice = selectedVariant ? (isDealer && selectedVariant.wholesalePrice ? Number(selectedVariant.wholesalePrice) : Number(selectedVariant.price)) : Number(product.price || 0);

  function handleAddToCart() {
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      variantId: selectedVariant.id,
      color: selectedVariant.color,
      storage: selectedVariant.storage,
      price: finalPrice,
      image: displayImage,
    });
    onClose();
    openCart();
  }

  function handleToggleFavorite() {
    toggleFavorite({
      id: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      slug: product.slug,
      image: displayImage,
      price: finalPrice,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl p-2 bg-white rounded-[2rem] overflow-hidden">
        {/* Left: Image */}
        <div className="relative aspect-square md:aspect-auto md:h-[500px] bg-stone-50 rounded-[1.5rem] overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-contain p-8"
          />
        </div>

        {/* Right: Info */}
        <div className="flex flex-col py-6 pr-6">
          <div className="mb-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{product.brand}</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-stone-900 leading-none mb-4">{product.name}</h2>
            
            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-black tracking-tighter text-stone-900">
                {finalPrice.toLocaleString("tr-TR")} ₺
              </span>
              {isDealer && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Bayi Fiyatı
                </span>
              )}
            </div>

            {/* Colors */}
            {colors.length > 0 && colors[0] !== "" && (
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Renk Seçimi</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        selectedColor === color 
                          ? "border-stone-900 bg-stone-900 text-white" 
                          : "border-stone-100 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage */}
            {storageOptions.length > 0 && storageOptions[0] !== "" && (
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Kapasite</p>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((storage: any) => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        selectedStorage === storage 
                          ? "border-stone-900 bg-stone-900 text-white" 
                          : "border-stone-100 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex gap-4">
            <button
              onClick={handleToggleFavorite}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all ${
                favorite 
                  ? "border-red-100 bg-red-50 text-red-500" 
                  : "border-stone-100 bg-white text-stone-400 hover:border-stone-300"
              }`}
            >
              <Heart className="h-6 w-6" fill={favorite ? "currentColor" : "none"} />
            </button>
            
            {selectedVariant.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-stone-900 text-white text-sm font-black uppercase tracking-widest transition-all hover:bg-black active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                Sepete Ekle
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center rounded-2xl bg-stone-100 text-stone-400 text-sm font-black uppercase tracking-widest cursor-not-allowed">
                Tükendi
              </div>
            )}
          </div>
          
          <button 
            onClick={() => router.push(`/products/${product.slug}`)}
            className="mt-6 w-full flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
          >
            Tüm Özellikleri Gör <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
