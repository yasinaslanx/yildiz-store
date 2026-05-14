import { ProductsGrid } from "@/components/product/products-grid";

export default function CategoryPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          Kulaklık & Ses
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Ses Ürünleri</h1>
      </div>

      <ProductsGrid category="audio" />
    </section>
  );
}
