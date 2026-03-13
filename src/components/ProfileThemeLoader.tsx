"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getProfile } from "@/lib/store";
import { useTheme } from "@/lib/theme-context";
import { themes } from "@/lib/themes";
import { backgrounds } from "@/lib/backgrounds";
import { isValidFontId } from "@/lib/fonts";
import type { ThemeId } from "@/lib/themes";
import type { FontId } from "@/lib/fonts";

const CUSTOM_COLOR_PREFIX = "custom-";
const CUSTOM_GRADIENT_PREFIX = "custom-gradient-";

/**
 * 編集ページでプロフィールのテーマ・壁紙・フォントをコンテキストに読み込む
 */
export function ProfileThemeLoader({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { setThemeId, setBackgroundId, setFontId } = useTheme();

  const isEditPage = pathname?.startsWith("/dashboard/edit/");

  useEffect(() => {
    if (!isEditPage || !slug) return;

    getProfile(slug).then((p) => {
      if (!p) return;

      if (p.themeId && themes.some((t) => t.id === p.themeId)) {
        setThemeId(p.themeId as ThemeId);
      }
      if (
        p.backgroundId &&
        (p.backgroundId.startsWith(CUSTOM_COLOR_PREFIX) ||
          p.backgroundId.startsWith(CUSTOM_GRADIENT_PREFIX) ||
          backgrounds.some((b) => b.id === p.backgroundId))
      ) {
        setBackgroundId(p.backgroundId);
      }
      if (p.fontId && isValidFontId(p.fontId)) {
        setFontId(p.fontId as FontId);
      }
    });
  }, [isEditPage, slug, setThemeId, setBackgroundId, setFontId]);

  return null;
}
