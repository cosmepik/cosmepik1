import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IS_PRODUCTION はサーバー（robots/sitemap/metadata）だけでなく、
  // クライアントコンポーネント（広告の出し分け等）でも参照する。
  // env に列挙するとビルド時にクライアントバンドルへインライン化されるため、
  // Netlify の既存環境変数 IS_PRODUCTION=true をそのまま流用できる。
  env: {
    IS_PRODUCTION: process.env.IS_PRODUCTION ?? "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "**.rakuten.co.jp", pathname: "/**" },
      { protocol: "https", hostname: "**.r10s.jp", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/**" },
    ],
  },
  async redirects() {
    return [
      // 公開プロフィールは /[username] を正式URLとする。
      // 旧 /p/[username] は同一内容の重複URL（未配布）なので、恒久(308)リダイレクトで
      // 1本化し、AdSense / Google から重複コンテンツと見なされないようにする。
      {
        source: "/p/:username",
        destination: "/:username",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
