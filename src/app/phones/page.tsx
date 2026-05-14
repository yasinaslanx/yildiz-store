import { FeatureStrip } from "@/components/product/feature-strip";
import { ProductsGrid } from "@/components/product/products-grid";

export default function PhonesPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Telefonlar
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Amiral Gemisi Telefonlar</h1>
          <p className="mt-4 max-w-2xl text-[var(--muted-foreground)]">
            Renk, hafıza, stok ve fiyat varyantlarıyla gerçek ürün mantığında
            çalışan telefon altyapısı.
          </p>
        </div>

        <ProductsGrid category="phones" />
      </section>

      <FeatureStrip />
    </div>
  );
}
