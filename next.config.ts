import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iyzipay uses dynamic require() which is incompatible with Turbopack bundling
  serverExternalPackages: ["iyzipay"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "sunixhub.com",
      },
      {
        protocol: "https",
        hostname: "sunix.com.tr",
      },
      {
        protocol: "https",
        hostname: "sunix.tr",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
    ],
  },
};

export default nextConfig;
