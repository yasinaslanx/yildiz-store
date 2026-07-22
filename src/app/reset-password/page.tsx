"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useUi } from "@/store/ui-store";

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

function ResetPasswordForm() {
  const { showToast } = useUi();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Şifre sıfırlama anahtarı (token) eksik.", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Şifre en az 8 karakter olmalıdır.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Şifreler eşleşmiyor.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || "Şifreniz başarıyla sıfırlandı.", "success");
        setSuccess(true);
      } else {
        showToast(data.message || "Şifre yenileme işlemi başarısız.", "error");
      }
    } catch {
      showToast("Bağlantı hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12 lg:py-24 text-center">
        <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl lg:p-16">
          <h1 className="text-3xl font-black text-stone-900 uppercase">Geçersiz Bağlantı</h1>
          <p className="mt-4 text-stone-500 font-medium">Şifre sıfırlama bağlantısı geçersiz veya eksik.</p>
          <Link
            href="/login"
            className="mt-8 inline-block cursor-pointer rounded-full border-2 border-black bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-stone-850"
          >
            Giriş Ekranına Git
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="rounded-[3rem] border border-stone-100 bg-white p-10 shadow-2xl shadow-stone-100 lg:p-16">
        <header className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Şifre Yenileme</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900">Yeni Şifre Belirle</h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            {success ? "Şifreniz güncellendi." : "Hesabınız için yeni ve güçlü bir şifre belirleyin."}
          </p>
        </header>

        {!success ? (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-1">Yeni Şifre</label>
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

              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        getPasswordStrength(password) < 50
                          ? "bg-red-500"
                          : getPasswordStrength(password) < 75
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${getPasswordStrength(password)}%` }}
                    />
                  </div>
                  <p
                    className={`text-[10px] font-bold ${
                      getPasswordStrength(password) < 50
                        ? "text-red-500"
                        : getPasswordStrength(password) < 75
                        ? "text-orange-500"
                        : "text-green-500"
                    }`}
                  >
                    {getPasswordStrength(password) < 50
                      ? "Zayıf (En az 8 karakter, büyük-küçük harf, sayı içermelidir)"
                      : getPasswordStrength(password) < 75
                      ? "Orta"
                      : "Güçlü"}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-2xl border bg-stone-50/30 px-5 py-4 text-sm font-bold text-stone-900 outline-none transition focus:bg-white ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-500"
                    : "border-stone-200 focus:border-black"
                }`}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">Şifreler eşleşmiyor</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 8 || password !== confirmPassword}
              className="w-full cursor-pointer rounded-full border-2 border-black bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-850 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-stone-200"
            >
              {loading ? "Şifre Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        ) : (
          <div className="mt-12 text-center space-y-6">
            <div className="flex justify-center text-green-500">
              <CheckCircle className="h-16 w-16" />
            </div>
            <div className="rounded-2xl bg-green-50 p-6 border border-green-100 text-green-800 text-sm font-medium">
              Yeni şifreniz başarıyla kaydedildi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </div>
            <Link
              href="/login"
              className="inline-block w-full cursor-pointer rounded-full border-2 border-black bg-black py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-stone-850 active:scale-[0.98]"
            >
              Şimdi Giriş Yap
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
