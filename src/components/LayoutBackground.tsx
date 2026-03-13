"use client";

import { usePathname } from "next/navigation";

const WALLPAPER_EXCLUDE = new Set([
  "/", "/login", "/register", "/contact", "/faq", "/privacy", "/price",
  "/guide", "/auth", "/influencer", "/dashboard", "/tokushoho",
]);

/** 壁紙・フォントを表示するパス（編集・プレビュー・公開ページのみ。ダッシュボード他は除外） */
export function shouldShowWallpaper(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/dashboard/edit/") || pathname.startsWith("/dashboard/preview")) return true;
  if (pathname.startsWith("/p/")) return true;
  if (pathname === "/demo") return true;
  if (pathname.startsWith("/dashboard") || WALLPAPER_EXCLUDE.has(pathname)) return false;
  if (/^\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function LayoutBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showWallpaper = shouldShowWallpaper(pathname);

  return (
    <div
      className="min-h-screen"
      style={
        showWallpaper
          ? {
              backgroundColor: "var(--page-bg, var(--background))",
              backgroundImage: "var(--page-bg-image, none)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : {
              backgroundColor: "var(--background)",
            }
      }
    >
      {children}
    </div>
  );
}
