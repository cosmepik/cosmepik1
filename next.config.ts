import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "**.rakuten.co.jp", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
