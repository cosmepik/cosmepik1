import type { MetadataRoute } from "next";
import { isProduction } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // AdSense「有用性の低いコンテンツ」対策。
      // 中身の薄い／認証系のアプリページをクロール対象から外し、
      // Google には記事・公開プロフィール・案内ページなど価値のある面だけを評価させる。
      // ※ /api はOG画像・画像プロキシ（公開ページの画像表示）に使うので除外しない。
      // ※ /p/ は /[username] へ 301 リダイレクトするため、ここではブロックしない
      //   （ブロックするとリダイレクトを辿れなくなる）。
      disallow: [
        "/dashboard",
        "/auth",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/influencer",
        "/demo",
      ],
    },
    sitemap: "https://cosmepik.me/sitemap.xml",
  };
}
