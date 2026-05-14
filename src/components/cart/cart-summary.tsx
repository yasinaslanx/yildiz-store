type CartSummaryProps = {
  subtotal: number;
  discount: number;
  shipping: number;
};

export function CartSummary({
  subtotal,
  discount,
  shipping,
}: CartSummaryProps) {
  const total = subtotal - discount + shipping;

  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-950">Sipariş Özeti</h2>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-stone-600">Ara Toplam</span>
          <span className="font-medium text-stone-950">
            {subtotal.toLocaleString("tr-TR")}₺
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-600">İndirim</span>
          <span className="font-medium text-green-700">
            -{discount.toLocaleString("tr-TR")}₺
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-600">Kargo</span>
          <span className="font-medium text-stone-950">
            {shipping === 0 ? "Ücretsiz" : `${shipping.toLocaleString("tr-TR")}₺`}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-stone-800">Toplam</span>
          <span className="text-2xl font-semibold text-stone-950">
            {total.toLocaleString("tr-TR")}₺
          </span>
        </div>
      </div>
    </div>
  );
}
