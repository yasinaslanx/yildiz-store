"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrderRequest, startIyzicoPaymentRequest } from "@/lib/api";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, clearLocalState } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "CREDIT_CARD"
  >("CREDIT_CARD");

  // Card State
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Kart numarasını formatla (4 hanede bir boşluk)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Son kullanma tarihini formatla (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Sepetiniz boş.");
      return;
    }

    if (paymentMethod === "CREDIT_CARD") {
      const cleanNumber = card.number.replace(/\s/g, "");
      if (cleanNumber.length < 16 || card.cvc.length < 3 || !card.expiry.includes("/")) {
        toast.error("Lütfen geçerli bir kart bilgisi girin.");
        return;
      }
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Siparişiniz işleniyor...");

      const order = await createOrderRequest({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingDistrict,
        shippingPostalCode,
        paymentMethod,
      });

      toast.dismiss(loadingToast);

      if (paymentMethod === "CREDIT_CARD") {
        toast.success("Ödeme işlemi başlatılıyor...");
        const payment = await startIyzicoPaymentRequest(order.id);
        window.location.href = payment.paymentPageUrl;
        return;
      }

      toast.success("Siparişiniz başarıyla alındı!");
      clearLocalState();
      router.push(`/orders/${order.id}?success=true`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sipariş oluşturulamadı.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 text-center">
         <div className="rounded-[3rem] border border-stone-200 bg-white p-16 shadow-2xl shadow-stone-100">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Oturum Açın</h1>
            <p className="mt-4 text-stone-500 font-medium">Siparişinizi tamamlamak için önce giriş yapmanız gerekmektedir.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-8 cursor-pointer rounded-full border-2 border-black bg-white px-10 py-4 text-sm font-black uppercase tracking-widest text-stone-900 transition hover:bg-stone-50"
            >
              Giriş Yapmaya Git
            </button>
         </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:py-20 animate-in fade-in duration-1000">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Güvenli Ödeme</p>
           <h1 className="mt-2 text-5xl font-black tracking-tighter text-stone-900 uppercase">Ödeme ve Teslimat</h1>
           <p className="mt-4 text-stone-500 max-w-lg font-medium leading-relaxed">Siparişinizi güvenle tamamlamak için bilgilerinizi kontrol edin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div className="space-y-12">
          {error && (
            <div className="rounded-[2rem] border border-red-100 bg-red-50 p-6 text-sm text-red-700 font-bold animate-in shake duration-500">
              {error}
            </div>
          )}

          {/* Step 1: Address */}
          <section className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-sm">
             <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-black">1</div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Teslimat Bilgileri</h2>
             </div>

             <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Ad Soyad</label>
                      <input 
                        required
                        className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                        value={customerName}
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "");
                          setCustomerName(val);
                        }}
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Telefon</label>
                      <input 
                        required
                        className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="05xx xxx xx xx"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Açık Adres</label>
                   <textarea 
                     required
                     rows={3}
                     className="w-full rounded-[2rem] border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium text-stone-900 outline-none focus:border-black focus:bg-white transition-all shadow-inner resize-none"
                     value={shippingAddress}
                     onChange={e => setShippingAddress(e.target.value)}
                     placeholder="Mahalle, sokak, bina ve daire bilgileri..."
                   />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şehir</label>
                      <input required className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition" value={shippingCity} onChange={e => setShippingCity(e.target.value)} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">İlçe</label>
                      <input required className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition" value={shippingDistrict} onChange={e => setShippingDistrict(e.target.value)} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Posta Kodu</label>
                      <input className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition" value={shippingPostalCode} onChange={e => setShippingPostalCode(e.target.value)} />
                   </div>
                </div>
             </div>
          </section>

          {/* Step 2: Payment */}
          <section className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-sm">
             <div className="flex items-center gap-4 mb-10">
                <div className="h-10 w-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-black">2</div>
                <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Ödeme Yöntemi</h2>
             </div>

             <div className="grid gap-6 md:grid-cols-3 mb-10">
                {[
                  { id: "CREDIT_CARD", label: "Kredi Kartı", icon: "💳" },
                  { id: "BANK_TRANSFER", label: "Banka Havalesi", icon: "🏦" },
                  { id: "CASH_ON_DELIVERY", label: "Kapıda Ödeme", icon: "🏠" }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`group flex flex-col items-center gap-3 rounded-[2rem] border-2 p-6 transition-all ${
                      paymentMethod === method.id 
                        ? "border-black bg-white shadow-xl shadow-stone-100" 
                        : "border-stone-50 bg-stone-50/50 text-stone-400 hover:border-stone-200"
                    }`}
                  >
                    <span className="text-3xl group-hover:scale-110 transition duration-500">{method.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
             </div>

             {paymentMethod === "CREDIT_CARD" && (
                <div className="animate-in slide-in-from-top-4 duration-500 space-y-10">
                   {/* Virtual Card View */}
                   <div className="mx-auto w-full max-w-[400px] aspect-[1.6/1] rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20" />
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                         <div className="flex justify-between items-start">
                            <div className="h-10 w-12 rounded-lg bg-stone-100/20 backdrop-blur-md flex items-center justify-center">
                               <div className="h-6 w-8 bg-stone-100/40 rounded shadow-inner" />
                            </div>
                            <span className="text-xl italic font-black">VISA</span>
                         </div>
                         
                         <div className="space-y-6">
                            <p className="text-2xl font-black tracking-[0.2em]">{card.number || "•••• •••• •••• ••••"}</p>
                            <div className="flex justify-between">
                               <div>
                                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Kart Sahibi</p>
                                  <p className="text-xs font-bold uppercase mt-1">{card.name || "İSİM SOYAD"}</p>
                               </div>
                               <div>
                                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Son Kullanma</p>
                                  <p className="text-xs font-bold mt-1">{card.expiry || "MM/YY"}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Card Form */}
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="md:col-span-2 space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kart Numarası</label>
                         <input 
                           maxLength={19}
                           className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition shadow-inner"
                           placeholder="0000 0000 0000 0000"
                           value={card.number}
                           onChange={e => setCard({...card, number: formatCardNumber(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Kart Üzerindeki İsim</label>
                         <input 
                           className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition shadow-inner"
                           placeholder="AHMET YILMAZ"
                           value={card.name}
                           onChange={e => setCard({...card, name: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "").toUpperCase()})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">S. Kullanma</label>
                            <input 
                              maxLength={5}
                              placeholder="MM/YY"
                              className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition shadow-inner"
                              value={card.expiry}
                              onChange={e => setCard({...card, expiry: formatExpiry(e.target.value)})}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">CVC</label>
                            <input 
                              maxLength={3}
                              placeholder="000"
                              className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-sm font-bold text-stone-900 outline-none focus:border-black focus:bg-white transition shadow-inner"
                              value={card.cvc}
                              onChange={e => setCard({...card, cvc: e.target.value.replace(/\D/g, '')})}
                            />
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </section>
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-8">
           <div className="rounded-[3rem] border border-stone-100 bg-stone-50/50 p-10 sticky top-24">
              <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter mb-10">Sipariş Özeti</h3>
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto scrollbar-hide">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 rounded-2xl border border-stone-100 bg-white p-2 flex-shrink-0">
                         <img src={item.image || "/placeholder.png"} alt={item.productName} className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-black text-stone-900 truncate uppercase">{item.productName}</p>
                         <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-bold text-stone-400">{item.quantity} Adet</span>
                            <span className="text-xs font-black text-stone-900">{(item.price * item.quantity).toLocaleString()} ₺</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-stone-200">
                 <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <span>Ara Toplam</span>
                    <span>{totalAmount.toLocaleString()} ₺</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <span>Kargo</span>
                    <span className="text-green-600 font-black">ÜCRETSİZ</span>
                 </div>
                 <div className="flex justify-between items-end pt-4">
                    <span className="text-lg font-black text-stone-900 uppercase tracking-tighter leading-none">Toplam</span>
                    <span className="text-3xl font-black text-stone-900 tracking-tighter leading-none">{totalAmount.toLocaleString()} ₺</span>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full mt-10 rounded-full bg-black py-6 text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-30 shadow-2xl shadow-stone-300"
              >
                 {loading ? 'Siparişiniz Alınıyor...' : 'Ödemeyi Tamamla'}
              </button>
           </div>

           <div className="rounded-[2.5rem] border-2 border-dashed border-stone-100 p-10 text-center">
              <div className="flex justify-center -space-x-3 mb-6">
                 {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-stone-100" />)}
              </div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] leading-relaxed">
                 <span className="text-stone-900">12,400+</span> Premium kullanıcı aramıza katıldı. Güvenli alışverişin keyfini çıkarın.
              </p>
           </div>
        </aside>
      </form>
    </main>
  );
}