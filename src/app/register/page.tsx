"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { Eye, EyeOff, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useUi();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Şifre gücü hesaplama
  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { score: 0, label: "", color: "bg-stone-200" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Zayıf", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Orta", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Güçlü", color: "bg-blue-500" };
    return { score: 4, label: "Çok Güçlü", color: "bg-emerald-500" };
  }, [form.password]);

  const handleSubmit = async () => {
    if (form.password.length < 8) {
      showToast("Şifre en az 8 karakter olmalıdır.", "error");
      return;
    }

    setLoading(true);
    const result = await register(form);

    if (!result.success) {
      showToast(result.message, "error");
      setLoading(false);
      return;
    }

    showToast(result.message, "success");
    router.push("/");
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-[2rem] border border-stone-100 bg-white p-10 shadow-xl shadow-stone-100">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
          Kayıt Ol
        </p>
        <h1 className="mt-4 text-4xl font-black italic tracking-tighter text-stone-900 uppercase">Yeni Hesap Oluştur</h1>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
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
              placeholder="E-posta adresiniz"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Şifre</p>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifreniz (En az 8 karakter)"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Şifre Gücü Göstergesi */}
            {form.password && (
              <div className="px-1 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {passwordStrength.score <= 1 ? <ShieldAlert className="h-3 w-3 text-red-500" /> : 
                     passwordStrength.score === 4 ? <ShieldCheck className="h-3 w-3 text-emerald-500" /> : 
                     <Shield className="h-3 w-3 text-stone-400" />}
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Şifre Gücü: <span className={passwordStrength.label ? "" : "text-stone-300"}>{passwordStrength.label || "Yazılıyor..."}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-500 ${
                        step <= passwordStrength.score ? passwordStrength.color : "bg-stone-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-10 rounded-full bg-stone-900 py-6 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-100"
        >
          {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
        </button>

        <p className="mt-8 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          Zaten hesabınız var mı?{" "}
          <button onClick={() => router.push("/login")} className="text-stone-900 underline underline-offset-4 hover:text-stone-500 transition">Giriş Yap</button>
        </p>
      </div>
    </section>
  );
}