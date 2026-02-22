import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "thumbnail.image.rakuten.co.jp", pathname: "/**" },
      { protocol: "https", hostname: "imobile.rakuten.co.jp", pathname: "/**" },
    ],
  },
};

export default nextConfig;
