"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store";
import { useUi } from "@/store/ui-store";
import { Eye, EyeOff } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useUi();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      showToast("Lütfen tüm alanları doldurun.", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast("Şifreler eşleşmiyor.", "error");
      return;
    }
    if (getPasswordStrength(form.password) < 50) {
      showToast("Lütfen daha güçlü bir şifre belirleyin.", "error");
      return;
    }

    setLoading(true);
    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mt-4 md:mt-0">
          Kayıt Ol
        </p>
        <h1 className="mt-4 text-4xl font-black italic tracking-tighter text-stone-900 uppercase">Yeni Hesap Oluştur</h1>

        <form onSubmit={handleSubmit} className="mt-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Ad</p>
              <input
                required
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
                required
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
                required
                placeholder="E-posta adresiniz"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none focus:border-stone-900 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-6 py-4 text-xs font-bold outline-none transition focus:border-stone-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrength(form.password) < 50 ? 'bg-red-500' : getPasswordStrength(form.password) < 75 ? 'bg-orange-500' : 'bg-green-500'}`} 
                      style={{ width: `${getPasswordStrength(form.password)}%` }} 
                    />
                  </div>
                  <p className={`text-[10px] font-bold ${getPasswordStrength(form.password) < 50 ? 'text-red-500' : getPasswordStrength(form.password) < 75 ? 'text-orange-500' : 'text-green-500'}`}>
                    {getPasswordStrength(form.password) < 50 ? 'Zayıf' : getPasswordStrength(form.password) < 75 ? 'Orta' : 'Güçlü'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Şifre Tekrar</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full rounded-2xl border bg-stone-50 px-6 py-4 text-xs font-bold outline-none transition focus:bg-white ${form.confirmPassword && form.confirmPassword !== form.password ? 'border-red-300 focus:border-red-500' : 'border-stone-100 focus:border-stone-900'}`}
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">Şifreler eşleşmiyor</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.password || form.password !== form.confirmPassword || getPasswordStrength(form.password) < 50}
            className="w-full mt-10 rounded-full bg-stone-900 py-6 text-xs font-black uppercase tracking-[0.3em] text-white hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-100"
          >
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          Zaten hesabınız var mı?{" "}
          <button onClick={() => router.push("/login")} className="text-stone-900 underline underline-offset-4 hover:text-stone-500 transition">Giriş Yap</button>
        </p>
      </div>
    </section>
  );
}