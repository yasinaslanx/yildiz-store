"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();
  const { showToast } = useUi();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      showToast("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    setLoading(true);
    const result = await sendOtp({ email: form.email });

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    setStep(2);
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      showToast("Lütfen 6 haneli doğrulama kodunu girin.", "error");
      return;
    }

    setLoading(true);
    const result = await verifyOtp({
      email: form.email,
      code,
      firstName: form.firstName,
      lastName: form.lastName,
      isRegister: true,
    });

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    router.refresh();
    router.push("/");
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-[2rem] border border-stone-100 bg-white p-10 shadow-xl shadow-stone-100 relative">
        {step === 2 && (
          <button 
            onClick={() => setStep(1)} 
            className="absolute left-10 top-10 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mt-8 md:mt-0">
          Kayıt Ol
        </p>
        <h1 className="mt-4 text-4xl font-black italic tracking-tighter text-stone-900 uppercase">Yeni Hesap Oluştur</h1>

        {step === 1 ? (
          <div className="mt-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Ad</p>
                <input
                  placeholder="Adınız"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Soyad</p>
                <input
                  placeholder="Soyadınız"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-posta</p>
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => handleSendCode()}
              disabled={loading}
              className="w-full mt-10 rounded-full bg-stone-900 py-6 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-100"
            >
              {loading ? "Kod Gönderiliyor..." : "Doğrulama Kodu Gönder"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <p className="text-sm font-medium text-stone-500 mb-8">
              <strong className="text-stone-900">{form.email}</strong> adresine gönderilen 6 haneli kodu girin.
            </p>
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Doğrulama Kodu</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[1em] text-2xl rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 font-black text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-black py-6 text-xs font-black uppercase tracking-[0.3em] text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-200"
            >
              {loading ? "Hesap Oluşturuluyor..." : "Kodu Doğrula ve Kayıt Ol"}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Zaten hesabınız var mı?{" "}
            <button onClick={() => router.push("/login")} className="text-stone-900 underline underline-offset-4 hover:text-stone-500 transition">Giriş Yap</button>
          </p>
        )}
      </div>
    </section>
  );
}