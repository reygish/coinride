/**
 * next.config.ts
 * Konfigurasi Next.js untuk Spendly.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan loading gambar dari domain eksternal (avatar user, dll.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",  // Supabase Storage untuk avatar
        pathname: "/storage/v1/**",
      },
    ],
  },

  // Experimental features untuk performa
  experimental: {
    // Optimasi package imports yang sering digunakan
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
