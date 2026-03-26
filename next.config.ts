import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "**.rakuten.co.jp", pathname: "/**" },
    ],
  },
};

export default nextConfig;
