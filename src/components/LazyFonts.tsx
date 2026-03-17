"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { shouldShowWallpaper } from "@/components/LayoutBackground";

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Cormorant+Garamond:wght@400;500;600;700",
    "family=M+PLUS+Rounded+1c:wght@400;500;700",
    "family=Shippori+Mincho:wght@400;500;600;700",
    "family=Zen+Kaku+Gothic+New:wght@400;500;700",
    "family=Zen+Maru+Gothic:wght@400;500;700",
    "family=Kosugi+Maru",
    "family=Noto+Serif+JP:wght@400;500;600;700",
  ].join("&") +
  "&display=swap";

/**
 * カスタムフォントが必要なページ（編集/プレビュー/公開）でのみ
 * Google Fonts を遅延読み込みする。ダッシュボードやLPでは読み込まない。
 */
export function LazyFonts() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);

  const needsFonts = shouldShowWallpaper(pathname);

  useEffect(() => {
    if (!needsFonts || loaded) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_CSS_URL;
    document.head.appendChild(link);
    setLoaded(true);
  }, [needsFonts, loaded]);

  if (!needsFonts || loaded) return null;
  return null;
}
