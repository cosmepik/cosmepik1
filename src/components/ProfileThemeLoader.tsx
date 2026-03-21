"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getProfile, setProfile } from "@/lib/store";
import { useTheme } from "@/lib/theme-context";
import { themes } from "@/lib/themes";
import { backgrounds } from "@/lib/backgrounds";
import { isValidFontId } from "@/lib/fonts";
import { cardDesigns } from "@/lib/card-designs";
import type { ThemeId } from "@/lib/themes";
import type { FontId } from "@/lib/fonts";
import type { CardDesignId } from "@/lib/card-designs";

const CUSTOM_COLOR_PREFIX = "custom-";
const CUSTOM_GRADIENT_PREFIX = "custom-gradient-";

function isValidBg(id: string | undefined): boolean {
  if (!id) return false;
  return id.startsWith(CUSTOM_COLOR_PREFIX) ||
    id.startsWith(CUSTOM_GRADIENT_PREFIX) ||
    backgrounds.some((b) => b.id === id);
}

/**
 * 編集ページでプロフィールのテーマ・壁紙・フォントをコンテキストに読み込む。
 * DB に欠損がある場合は localStorage の値を DB に復元する。
 */
export function ProfileThemeLoader({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { themeId, backgroundId, fontId, cardDesignId, textColor, setThemeId, setBackgroundId, setFontId, setCardDesignId, setCardColor, setTextColor } = useTheme();

  const isEditPage = pathname?.startsWith("/dashboard/edit/");

  useEffect(() => {
    if (!isEditPage || !slug) return;

    getProfile(slug).then((p) => {
      if (!p) return;

      if (p.themeId && themes.some((t) => t.id === p.themeId)) {
        setThemeId(p.themeId as ThemeId);
      }
      if (isValidBg(p.backgroundId)) {
        setBackgroundId(p.backgroundId!);
      }
      if (p.fontId && isValidFontId(p.fontId)) {
        setFontId(p.fontId as FontId);
      }
      if (p.cardDesignId && cardDesigns.some((c) => c.id === p.cardDesignId)) {
        setCardDesignId(p.cardDesignId as CardDesignId);
      }
      if (p.cardColor !== undefined) {
        setCardColor(p.cardColor ?? "");
      }
      if (p.textColor !== undefined) {
        setTextColor(p.textColor ?? "");
      }

      // DB に欠損しているスタイル設定を localStorage（ThemeContext）から復元
      const patch: Record<string, unknown> = {};
      if (!p.themeId && themeId && themes.some((t) => t.id === themeId)) {
        patch.themeId = themeId;
      }
      if (!p.backgroundId && isValidBg(backgroundId)) {
        patch.backgroundId = backgroundId;
      }
      if (!p.fontId && fontId && isValidFontId(fontId)) {
        patch.fontId = fontId;
      }
      if (!p.cardDesignId && cardDesignId && cardDesignId !== "default" && cardDesigns.some((c) => c.id === cardDesignId)) {
        patch.cardDesignId = cardDesignId;
      }
      if (!p.textColor && textColor) {
        patch.textColor = textColor;
      }

      if (Object.keys(patch).length > 0) {
        setProfile({
          username: slug,
          ...patch,
          updatedAt: new Date().toISOString(),
        } as Parameters<typeof setProfile>[0]).catch(() => {});
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditPage, slug]);

  return null;
}
