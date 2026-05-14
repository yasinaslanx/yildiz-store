import type { AuthUser } from "@/store/auth-store";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function registerRequest(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const response = await fetch("/api/auth/register", {
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

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const response = await fetch("/api/auth/login", {
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