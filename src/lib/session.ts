import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { cache } from "react";

const SESSION_COOKIE_NAME = "ys_session";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-this",
);

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "DEALER";
  permissions?: string[];
};

export async function createSessionToken(user: SessionUser, rememberMe: boolean = true) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "30d" : "1d")
    .sign(secret);
}

export async function setSessionCookie(user: SessionUser, rememberMe: boolean = true) {
  const token = await createSessionToken(user, rememberMe);
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
  Sentry.setUser(null);
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as Partial<SessionUser>;

    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    if (!user) return null;

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as "USER" | "ADMIN" | "DEALER",
      permissions: user.permissions || [],
    };

    // Sentry user context
    Sentry.setUser({
      id: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
    });

    return sessionUser;
  } catch (error) {
    console.error("SESSION ERROR:", error);
    return null;
  }
});

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireSessionUser();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireAdminUser();

  // ENV'den ve varsayılan listeden süper admin e-postalarını al
  const envEmails = process.env.SUPERADMIN_EMAILS
    ? process.env.SUPERADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : ["admin@sunixstore.com", "aslanyasin320@gmail.com"];

  const isSuperAdmin = envEmails.includes(user.email.toLowerCase());
  if (isSuperAdmin) {
    return user;
  }

  if (!user.permissions?.includes(permission)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
