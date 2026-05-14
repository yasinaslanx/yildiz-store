import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "ys_session";

// JWT Secret'ı TextEncoder ile encode ediyoruz
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-this",
);

type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

// Çerezden kullanıcı oturum bilgisini çözen yardımcı fonksiyon
async function getSessionUser(
  request: NextRequest,
): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // jose kütüphanesi ile JWT doğrulaması
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as Partial<SessionUser>;

    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role as "USER" | "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionUser = await getSessionUser(request);
  
  const isAuthenticated = !!sessionUser;
  const isAdmin = sessionUser?.role === "ADMIN";

  // Giriş yapılması zorunlu sayfalar
  const protectedRoutes = [
    "/checkout",
    "/orders",
    "/profile",
    "/favorites",
    "/cart",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 1. Giriş yapılmamışsa login sayfasına yönlendir
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Giriş yaptıktan sonra geri dönülecek sayfayı ekle
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin rotaları kontrolü
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!isAdmin) {
      // Admin değilse ana sayfaya at
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. Zaten giriş yapmış kullanıcıyı login/register sayfalarından uzaklaştır
  if (
    isAuthenticated &&
    (pathname === "/login" || pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi rotalarda çalışacağını belirliyoruz
export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/cart/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
