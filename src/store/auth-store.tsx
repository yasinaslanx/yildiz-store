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
};

type SendOtpPayload = {
  email: string;
};

type VerifyOtpPayload = {
  email: string;
  code: string;
  firstName?: string;
  lastName?: string;
  isRegister: boolean;
  rememberMe?: boolean;
};

type AuthResult = {
  success: boolean;
  message: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (payload: SendOtpPayload) => Promise<AuthResult>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthResult>;
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
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const sendOtp = async (payload: SendOtpPayload): Promise<AuthResult> => {
    const result = await sendOtpRequest(payload);

    if (!result.ok) {
      return {
        success: false,
        message: result.message || "Kod gönderilemedi.",
      };
    }

    return {
      success: true,
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
    };
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