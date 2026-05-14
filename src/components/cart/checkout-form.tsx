"use client";

import { useState } from "react";
import { useCart } from "@/store/cart-store";
import { useOrder, type OrderCustomer } from "@/store/order-store";
import { useOrderHistory } from "@/store/order-history-store";
import { useUi } from "@/store/ui-store";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { createOrderRequest } from "@/lib/api";
import { useAuth } from "@/store/auth-store";

type FormErrors = Partial<
  Record<
    keyof OrderCustomer | "cardHolder" | "cardNumber" | "expiry" | "cvv",
    string
  >
>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart, clearLocalState: clearCartState } = useCart();
  const { setLastOrder } = useOrder();
  const { addOrder } = useOrderHistory();
  const { showToast } = useUi();
  const { user } = useAuth();

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customer, setCustomer] = useState<OrderCustomer>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    address: "",
  });

  const [payment, setPayment] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const shipping = totalPrice >= 3000 ? 0 : 149;
  const discount = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice - discount + shipping;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "YILDIZ10") {
      setCouponApplied(true);
      showToast("Kupon uygulandı: %10 indirim", "success");
    } else {
      setCouponApplied(false);
      showToast("Kupon kodu geçersiz", "error");
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!customer.firstName.trim()) nextErrors.firstName = "Ad gerekli";
    if (!customer.lastName.trim()) nextErrors.lastName = "Soyad gerekli";
    if (!customer.email.trim()) nextErrors.email = "E-posta gerekli";
    if (!/\S+@\S+\.\S+/.test(customer.email))
      nextErrors.email = "Geçerli e-posta girin";
    if (!customer.phone.trim()) nextErrors.phone = "Telefon gerekli";
    if (!customer.city.trim()) nextErrors.city = "Şehir gerekli";
    if (!customer.district.trim()) nextErrors.district = "İlçe gerekli";
    if (!customer.address.trim()) nextErrors.address = "Adres gerekli";

    if (!payment.cardHolder.trim())
      nextErrors.cardHolder = "Kart sahibi gerekli";

    const normalizedCard = payment.cardNumber.replace(/\s/g, "");
    if (!normalizedCard) nextErrors.cardNumber = "Kart numarası gerekli";
    if (normalizedCard.length < 16)
      nextErrors.cardNumber = "Kart numarası eksik";

    if (!payment.expiry.trim())
      nextErrors.expiry = "Son kullanma tarihi gerekli";
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry))
      nextErrors.expiry = "AA/YY formatı kullanın";

    if (!payment.cvv.trim()) nextErrors.cvv = "CVV gerekli";
    if (!/^\d{3,4}$/.test(payment.cvv))
      nextErrors.cvv = "Geçerli CVV girin";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!validate()) {
      showToast("Lütfen formdaki hataları düzeltin", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Sepetiniz boş", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        shippingCity: customer.city,
        shippingDistrict: customer.district,
        shippingPostalCode: "", // Add if you have this field in form
        paymentMethod: "CREDIT_CARD" as const,
      };

      const order = await createOrderRequest(payload);

      clearCartState();
      
      showToast("Siparişiniz başarıyla oluşturuldu!", "success");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Sipariş oluşturulamadı",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (key: keyof FormErrors) =>
    errors[key] ? (
      <p className="mt-2 text-xs text-red-600">{errors[key]}</p>
    ) : null;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Teslimat Bilgileri</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <input
                value={customer.firstName}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, firstName: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "") }))
                }
                placeholder="Ad"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("firstName")}
            </div>

            <div>
              <input
                value={customer.lastName}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, lastName: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "") }))
                }
                placeholder="Soyad"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("lastName")}
            </div>

            <div>
              <input
                value={customer.email}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="E-posta"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("email")}
            </div>

            <div>
              <input
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="Telefon"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("phone")}
            </div>

            <div>
              <input
                value={customer.city}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Şehir"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("city")}
            </div>

            <div>
              <input
                value={customer.district}
                onChange={(e) =>
                  setCustomer((prev) => ({ ...prev, district: e.target.value }))
                }
                placeholder="İlçe"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("district")}
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={customer.address}
              onChange={(e) =>
                setCustomer((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Açık adres"
              rows={4}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />
            {fieldError("address")}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Ödeme Bilgileri</h2>

          <div className="mt-6 space-y-4">
            <div>
              <input
                value={payment.cardHolder}
                onChange={(e) =>
                  setPayment((prev) => ({ ...prev, cardHolder: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "") }))
                }
                placeholder="Kart Üzerindeki İsim"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("cardHolder")}
            </div>

            <div>
              <input
                value={payment.cardNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = raw.replace(/(.{4})/g, "$1 ").trim();

                  setPayment((prev) => ({
                    ...prev,
                    cardNumber: formatted,
                  }));
                }}
                placeholder="Kart Numarası"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
              />
              {fieldError("cardNumber")}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  value={payment.expiry}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const formatted =
                      raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;

                    setPayment((prev) => ({
                      ...prev,
                      expiry: formatted,
                    }));
                  }}
                  placeholder="AA/YY"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
                />
                {fieldError("expiry")}
              </div>

              <div>
                <input
                  value={payment.cvv}
                  onChange={(e) =>
                    setPayment((prev) => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  placeholder="CVV"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
                />
                {fieldError("cvv")}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Kupon</h2>

          <div className="mt-4 flex gap-3">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="İndirim kodu"
              className="flex-1 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-stone-900"
            />
            <button
              onClick={applyCoupon}
              className="rounded-xl border border-stone-900 px-5 py-3 text-sm font-medium"
            >
              Uygula
            </button>
          </div>

          {couponApplied && (
            <p className="mt-3 text-sm text-green-700">%10 indirim uygulandı.</p>
          )}
        </div>
      </div>

      <div className="h-fit rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Sipariş Özeti</h2>

        <div className="mt-6 space-y-4 border-b border-stone-200 pb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {item.productName}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {item.color}
                  {item.storage ? ` / ${item.storage}` : ""} / {item.quantity} adet
                </p>
              </div>
              <div className="text-sm font-medium text-stone-900">
                {(item.price * item.quantity).toLocaleString("tr-TR")}₺
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Ara Toplam</span>
            <span className="font-medium">
              {totalPrice.toLocaleString("tr-TR")}₺
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">İndirim</span>
            <span className="font-medium text-green-700">
              -{discount.toLocaleString("tr-TR")}₺
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-600">Kargo</span>
            <span className="font-medium">
              {shipping === 0 ? "Ücretsiz" : `${shipping.toLocaleString("tr-TR")}₺`}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-6">
          <div className="flex justify-between">
            <span className="text-base font-medium">Toplam</span>
            <span className="text-2xl font-semibold">
              {finalTotal.toLocaleString("tr-TR")}₺
            </span>
          </div>
        </div>

        <div className="mt-6">
          <LoadingButton
            onClick={() => handleSubmit()}
            isLoading={isSubmitting}
            className="w-full"
          >
            Siparişi Tamamla
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}