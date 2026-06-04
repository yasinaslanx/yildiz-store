import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LiveSupport } from "@/components/layout/live-support";
import { StoreProviders } from "@/components/providers/store-providers";
import { MiniCart } from "@/components/cart/mini-cart";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sunix Store | Premium Teknoloji ve Aksesuar Mağazası",
    template: "%s | Sunix Store"
  },
  description: "En yeni iPhone modelleri, premium kılıflar, ses sistemleri ve teknolojik aksesuarların tek adresi. Modern tasarım, eşsiz performans.",
  keywords: ["teknoloji", "iphone", "aksesuar", "premium", "sunix", "sunixstore", "elektronik"],
  authors: [{ name: "Sunix Store" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://sunixstore.com",
    title: "Sunix Store | Teknoloji Yeniden Tanımlandı",
    description: "Premium teknoloji ve aksesuar deneyimi.",
    siteName: "Sunix Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunix Store | Teknoloji Yeniden Tanımlandı",
    description: "Premium teknoloji ve aksesuar deneyimi.",
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`bg-[var(--background)] text-[var(--foreground)] ${nunito.variable}`}>
        <StoreProviders>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main>{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <MiniCart />
          </Suspense>
          <Suspense fallback={null}>
            <LiveSupport />
          </Suspense>
          <Toaster position="bottom-right" />
          <Analytics />
        </StoreProviders>
      </body>
    </html>
  );
}
