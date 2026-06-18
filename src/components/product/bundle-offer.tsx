"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, ShoppingBag, Zap } from "lucide-react";

type BundleVariant = {
  id: string;
  price: number;
  wholesalePrice?: number | null;
  color: string;
};

type BundleProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: { url: string }[];
  variants: BundleVariant[];
};

type BundleDeal = {
  id: string;
  name: string;
  discountPercent: number;
  bundleProduct: BundleProduct;
};

type Props = {
  productSlug: string;
  mainProductPrice: number;
  onAddBundle: (bundleVariantId: string, discount: number, bundleDealId: string) => void;
};

export default function BundleOffer({ productSlug, mainProductPrice, onAddBundle }: Props) {
  const [bundles, setBundles] = useState<BundleDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await fetch(`/api/products/${productSlug}/bundles`);
        const json = await res.json();
        if (json.success) setBundles(json.data);
      } catch (e) {
        console.error("Bundle fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, [productSlug]);

  if (loading || bundles.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Özel Paket Teklifleri</p>
      </div>

      {bundles.map((bundle) => {
        const bundleVariant = bundle.bundleProduct.variants[0];
        if (!bundleVariant) return null;

        const bundlePrice = bundleVariant.price;
        const originalTotal = mainProductPrice + bundlePrice;
        const discountAmount = Math.round((bundlePrice * bundle.discountPercent) / 100);
        const discountedTotal = originalTotal - discountAmount;
        const bundleImage = bundle.bundleProduct.images[0]?.url;

        return (
          <div
            key={bundle.id}
            className="relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6"
          >
            {/* Badge */}
            <div className="absolute top-4 right-4 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
              %{bundle.discountPercent} İndirim
            </div>

            <div className="flex items-center gap-4 mb-5">
              {/* Main product placeholder */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-amber-100">
                <ShoppingBag className="w-6 h-6 text-amber-400" />
              </div>

              <Plus className="w-5 h-5 text-amber-400 flex-shrink-0" />

              {/* Bundle product image */}
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-sm border border-amber-100 flex-shrink-0">
                {bundleImage ? (
                  <Image
                    src={bundleImage}
                    alt={bundle.bundleProduct.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-stone-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-stone-900 truncate">{bundle.name}</p>
                <p className="text-xs text-stone-500 mt-0.5 truncate">{bundle.bundleProduct.name}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-stone-400 line-through">
                  Normal: {originalTotal.toLocaleString("tr-TR")} ₺
                </p>
                <p className="text-2xl font-black text-stone-900 tracking-tighter">
                  {discountedTotal.toLocaleString("tr-TR")} ₺
                </p>
                <p className="text-xs font-bold text-amber-600 mt-1">
                  {discountAmount.toLocaleString("tr-TR")} ₺ tasarruf edersiniz!
                </p>
              </div>
              <button
                onClick={() => onAddBundle(bundleVariant.id, bundle.discountPercent, bundle.id)}
                className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Paketi Al
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
