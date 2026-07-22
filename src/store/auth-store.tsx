"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  sendOtpRequest,
  verifyOtpRequest,
  logoutRequest,
} from "@/lib/auth-api";

export type UserRole = "user" | "admin" | "dealer" | "USER" | "ADMIN" | "DEALER";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  needsPassword?: boolean;
  isEmailVerified?: boolean;
};

type SendOtpPayload = {
  email: string;
  password?: string;
  isRegister?: boolean;
};

type VerifyOtpPayload = {
  email: string;
  code: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isRegister: boolean;
  rememberMe?: boolean;
};

type AuthResult = {
  success: boolean;
  message: string;
  data?: AuthUser;
  bypassOtp?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (payload: SendOtpPayload) => Promise<AuthResult>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthResult>;
  register: (payload: any) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AUTH_USER_KEY = "sunix-store-auth-user";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser;
        queueMicrotask(() => setUser(parsed));
      } catch {
        queueMicrotask(() => setUser(null));
      }
    }

    // Always sync with the server to ensure session is valid and sync missing localStorage
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser(data.data);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.data));
        } else {
          // If server says unauthorized, clear client state
          setUser(null);
          localStorage.removeItem(AUTH_USER_KEY);
          sessionStorage.removeItem(AUTH_USER_KEY);
        }
      })
      .catch(() => {
        // Silent catch, keep existing state if network fails
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const sendOtp = async (payload: SendOtpPayload): Promise<AuthResult & { bypassOtp?: boolean }> => {
    const result = await sendOtpRequest(payload);

    if (!result.ok) {
      return {
        success: false,
        message: result.message || "Kod gönderilemedi.",
      };
    }

    if (result.bypassOtp && result.data) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
      setUser(result.data);
    }

    return {
      success: true,
      bypassOtp: result.bypassOtp,
      data: result.data,
      message: result.message || "Doğrulama kodu gönderildi.",
    };
  };

  const verifyOtp = async (payload: VerifyOtpPayload): Promise<AuthResult> => {
    const result = await verifyOtpRequest(payload);

    if (!result.ok || !result.data) {
      return {
        success: false,
        message: result.message || "Doğrulama başarısız.",
      };
    }

    if (payload.rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
    }
    setUser(result.data);

    return {
      success: true,
      message: result.message || "Giriş başarılı.",
      data: result.data,
    };
  };

  const register = async (payload: any): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return {
          success: false,
          message: result.message || "Kayıt sırasında bir hata oluştu.",
        };
      }

      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
      setUser(result.data);

      return {
        success: true,
        message: result.message || "Kayıt işlemi başarılı.",
        data: result.data,
      };
    } catch {
      return {
        success: false,
        message: "Kayıt yapılırken bir ağ hatası oluştu.",
      };
    }
  };

  const logout = async () => {
    await logoutRequest();
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      sendOtp,
      verifyOtp,
      register,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}