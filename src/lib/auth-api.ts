import type { AuthUser } from "@/store/auth-store";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function sendOtpRequest(payload: {
  email: string;
  password?: string;
  isRegister?: boolean;
}) {
  const response = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse<AuthUser> & { bypassOtp?: boolean };

  return {
    ok: response.ok && result.success,
    bypassOtp: result.bypassOtp,
    data: result.data,
    message: result.message || "",
  };
}

export async function verifyOtpRequest(payload: {
  email: string;
  code: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isRegister: boolean;
  rememberMe?: boolean;
}) {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse<AuthUser>;

  return {
    ok: response.ok && result.success,
    data: result.data,
    message: result.message || "",
  };
}

export async function logoutRequest() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  const result = (await response.json()) as ApiResponse<null>;

  return {
    ok: response.ok && result.success,
    message: result.message || "",
  };
}