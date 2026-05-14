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
    ],
  },
};

export default nextConfig;
