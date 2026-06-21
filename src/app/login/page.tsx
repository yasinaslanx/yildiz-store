"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();
  const { showToast } = useUi();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Lütfen e-posta adresinizi girin.", "error");
      return;
    }

    setLoading(true);
    const result = await sendOtp({ email });

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
      email,
      code,
      isRegister: false,
      rememberMe,
    });

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    router.refresh();
    router.push(redirect);
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-lg px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100 lg:p-16">
        <header className="text-center relative">
           {step === 2 && (
             <button 
               onClick={() => setStep(1)} 
               className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
             >
               <ArrowLeft className="h-5 w-5" />
             </button>
           )}
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Hoş Geldiniz</p>
           <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900">Giriş Yap</h1>
           <p className="mt-2 text-sm font-medium text-stone-500">
             {step === 1 ? "Hesabınıza erişmek için e-posta adresinizi girin." : "E-postanıza gönderilen 6 haneli kodu girin."}
           </p>
        </header>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="mt-12 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">E-posta Adresi</label>
              <input
                type="email"
                required
                placeholder="ornek@sunixstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-black cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs font-bold text-stone-600 cursor-pointer select-none">
                Beni Hatırla
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-white py-5 text-sm font-black uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-100"
            >
              {loading ? "Gönderiliyor..." : "Kodu Gönder"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Doğrulama Kodu</label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[1em] text-2xl rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 font-black text-stone-900 outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-200"
            >
              {loading ? "Doğrulanıyor..." : "Giriş Yap"}
            </button>
          </form>
        )}

        {step === 1 && (
          <footer className="mt-10 text-center">
             <p className="text-xs font-bold text-stone-400">
               Henüz bir hesabınız yok mu?{' '}
               <Link href="/register" className="font-black text-stone-900 underline underline-offset-4 transition hover:text-stone-600">
                 Kayıt Ol
               </Link>
             </p>
          </footer>
        )}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}