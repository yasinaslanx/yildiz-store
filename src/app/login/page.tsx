"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

function getPasswordStrength(pass: string) {
  let score = 0;
  if (!pass) return 0;
  if (pass.length > 5) score += 25;
  if (pass.length >= 8) score += 25;
  if (pass.match(/[A-Z]/)) score += 25;
  if (pass.match(/[0-9]/)) score += 25;
  if (pass.match(/[^A-Za-z0-9]/)) score += 25;
  return Math.min(100, score);
}

function LoginForm() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();
  const { showToast } = useUi();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  
  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && inputRef.current) {
      // Add a slight delay to allow transition to start/finish
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Lütfen e-posta adresinizi ve şifrenizi girin.", "error");
      return;
    }

    setLoading(true);
    const result = await sendOtp({ email, password, isRegister: false });

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
      password,
      isRegister: false,
      rememberMe,
    });

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    
    if (result.data?.needsPassword) {
      setStep(3);
    } else {
      router.refresh();
      router.push(redirect);
    }
    setLoading(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Şifreler eşleşmiyor.", "error");
      return;
    }
    if (getPasswordStrength(newPassword) < 50) {
      showToast("Lütfen daha güçlü bir şifre belirleyin.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Şifreniz oluşturuldu ve giriş yapıldı.", "success");
        router.refresh();
        router.push(redirect);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("Bağlantı hatası.", "error");
    } finally {
      setLoading(false);
    }
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
           <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900">
             {step === 3 ? "Şifre Belirle" : "Giriş Yap"}
           </h1>
           <p className="mt-2 text-sm font-medium text-stone-500">
             {step === 1 && "Hesabınıza erişmek için e-posta adresinizi ve şifrenizi girin."}
             {step === 2 && "E-postanıza gönderilen 6 haneli kodu girin."}
             {step === 3 && "Hesabınız için kalıcı bir şifre belirleyin."}
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
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
        ) : step === 2 ? (
          <form onSubmit={handleVerifyCode} className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Doğrulama Kodu</label>
              <input
                ref={inputRef}
                type="text"
                required
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
        ) : (
          <form onSubmit={handleSetPassword} className="mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:border-black focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword) < 50 ? 'bg-red-500' : getPasswordStrength(newPassword) < 75 ? 'bg-orange-500' : 'bg-green-500'}`} 
                      style={{ width: `${getPasswordStrength(newPassword)}%` }} 
                    />
                  </div>
                  <p className={`text-[10px] font-bold ${getPasswordStrength(newPassword) < 50 ? 'text-red-500' : getPasswordStrength(newPassword) < 75 ? 'text-orange-500' : 'text-green-500'}`}>
                    {getPasswordStrength(newPassword) < 50 ? 'Zayıf' : getPasswordStrength(newPassword) < 75 ? 'Orta' : 'Güçlü'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şifre Tekrar</label>
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-2xl border bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:bg-white ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-black'}`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">Şifreler eşleşmiyor</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword || getPasswordStrength(newPassword) < 50}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-200"
            >
              {loading ? "Kaydediliyor..." : "Güncelle ve Giriş Yap"}
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