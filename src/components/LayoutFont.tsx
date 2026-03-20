"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { shouldShowWallpaper } from "@/components/LayoutBackground";
import { useTheme, applyFont } from "@/lib/theme-context";
import { getFontFamily } from "@/lib/fonts";
import type { FontId } from "@/lib/fonts";

const DEFAULT_FONT_ID: FontId = "noto-sans";

function isPublicProfilePath(p: string | null): boolean {
  if (!p) return false;
  if (p.startsWith("/p/")) return true;
  if (/^\/[^/]+$/.test(p) && !["/", "/login", "/register", "/contact", "/faq", "/privacy", "/price", "/guide", "/demo", "/tokushoho"].includes(p) && !p.startsWith("/dashboard") && !p.startsWith("/influencer") && !p.startsWith("/auth")) return true;
  return false;
}

/** ダッシュボード等ではフォントをデフォルトに、編集・プレビュー・公開ページではプロフィールのフォントを適用 */
export function LayoutFont() {
  const pathname = usePathname();
  const { fontId } = useTheme();

  useEffect(() => {
    // 公開プロフィールページでは SSR がフォントを提供するためスキップ
    if (isPublicProfilePath(pathname)) return;

    if (shouldShowWallpaper(pathname)) {
      applyFont(fontId);
    } else {
      document.documentElement.style.setProperty("--font-body", getFontFamily(DEFAULT_FONT_ID));
    }
  }, [pathname, fontId]);

  return null;
}
