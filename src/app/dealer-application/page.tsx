"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export default function DealerApplicationPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    taxOffice: "",
    taxNumber: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (user?.role === "DEALER" || String(user?.role) === "DEALER") {
      setApplicationStatus("APPROVED");
      setLoading(false);
      return;
    }

    async function checkApplication() {
      try {
        const res = await fetch("/api/dealer-application");
        const json = await res.json();
        if (json.success && json.data) {
          setApplicationStatus(json.data.status);
        }
      } catch (err) {
        console.error("Bayi başvuru kontrolü başarısız:", err);
      } finally {
        setLoading(false);
      }
    }

    checkApplication();
  }, [isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/dealer-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Bir hata oluştu.");
      }

      setSuccess(true);
      setApplicationStatus("PENDING");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
          <ShieldAlert className="w-16 h-16 text-stone-300 mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Giriş Yapın</h1>
          <p className="text-stone-500 font-medium">Bayilik başvurusunda bulunmak için öncelikle üye olmalı veya giriş yapmalısınız.</p>
          <div className="pt-4">
            <Link href="/login" className="flex items-center justify-center w-full bg-stone-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest hover:bg-black transition-colors">
              Giriş / Kayıt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus === "APPROVED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
         <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Tebrikler!</h1>
          <p className="text-stone-500 font-medium">Siz zaten Yıldız Store'un onaylı bir bayisisiniz. Tüm ürünlerde özel toptan fiyatlarınızı görebilirsiniz.</p>
          <div className="pt-4">
            <Link href="/products" className="flex items-center justify-center w-full bg-stone-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest hover:bg-black transition-colors">
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus === "PENDING") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
          <Clock className="w-20 h-20 text-yellow-500 mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Başvurunuz İnceleniyor</h1>
          <p className="text-stone-500 font-medium">Bayilik başvurunuz tarafımıza ulaşmıştır. Yönetim ekibimiz tarafından incelendikten sonra bilgilendirileceksiniz.</p>
          <div className="pt-4">
            <Link href="/" className="flex items-center justify-center w-full bg-stone-100 text-stone-900 rounded-2xl h-14 font-black uppercase tracking-widest hover:bg-stone-200 transition-colors">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus === "REJECTED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/50">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Başvuru Reddedildi</h1>
          <p className="text-stone-500 font-medium">Maalesef bayilik başvurunuz uygun bulunmamıştır. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">B2B Çözümleri</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tighter text-stone-900 uppercase">Bayilik Başvurusu</h1>
        <p className="mt-6 text-stone-500 font-medium max-w-xl mx-auto">
          Yıldız Store bayisi olun, tüm ürünlerimizde özel toptan fiyatlardan ve avantajlı kampanyalardan faydalanın.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-stone-100 shadow-2xl shadow-stone-200/40">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Firma Adı</label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium transition-all focus:border-stone-900 focus:bg-white focus:outline-none"
              placeholder="Firma veya Şahıs Şirketi Adı"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Vergi Dairesi</label>
              <input
                type="text"
                name="taxOffice"
                required
                value={formData.taxOffice}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium transition-all focus:border-stone-900 focus:bg-white focus:outline-none"
                placeholder="Örn: Beyoğlu VD"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Vergi Numarası / TCKN</label>
              <input
                type="text"
                name="taxNumber"
                required
                value={formData.taxNumber}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium transition-all focus:border-stone-900 focus:bg-white focus:outline-none"
                placeholder="10 Veya 11 Haneli"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">İletişim Telefonu</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium transition-all focus:border-stone-900 focus:bg-white focus:outline-none"
              placeholder="0 (5XX) XXX XX XX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Açık Adres</label>
            <textarea
              name="address"
              required
              rows={4}
              value={formData.address}
              onChange={handleChange}
              className="w-full resize-none rounded-2xl border-2 border-stone-100 bg-stone-50 px-6 py-4 text-sm font-medium transition-all focus:border-stone-900 focus:bg-white focus:outline-none"
              placeholder="Firmanızın tam adresi"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 flex items-center justify-center rounded-2xl bg-stone-900 h-16 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
          </button>
        </form>
      </div>
    </div>
  );
}
