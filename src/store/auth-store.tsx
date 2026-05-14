"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/lib/auth-api";

export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResult = {
  success: boolean;
  message: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AUTH_USER_KEY = "yildiz-store-auth-user";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_USER_KEY);

    if (!raw) return;

    try {
      setUser(JSON.parse(raw) as AuthUser);
    } catch {
      setUser(null);
    }
  }, []);

  const register = async (payload: RegisterPayload): Promise<AuthResult> => {
    const result = await registerRequest(payload);

    if (!result.ok || !result.data) {
      return {
        success: false,
        message: result.message || "Kayıt başarısız.",
      };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
    setUser(result.data);

    return {
      success: true,
      message: "Kayıt başarılı.",
    };
  };

  const login = async (payload: LoginPayload): Promise<AuthResult> => {
    const result = await loginRequest(payload);

    if (!result.ok || !result.data) {
      return {
        success: false,
        message: result.message || "Giriş başarısız.",
      };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.data));
    setUser(result.data);

    return {
      success: true,
      message: "Giriş başarılı.",
    };
  };

  const logout = async () => {
    await logoutRequest();
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      register,
      login,
      logout,
    }),
    [user],
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