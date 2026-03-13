"use client";

import { useEffect } from "react";
import { applyTheme, applyBackground, applyFont } from "@/lib/theme-context";
import { themes, type ThemeId } from "@/lib/themes";
import { backgrounds } from "@/lib/backgrounds";
import { isValidFontId, type FontId } from "@/lib/fonts";
import type { InfluencerProfile } from "@/types";

const CUSTOM_COLOR_PREFIX = "custom-";
const CUSTOM_GRADIENT_PREFIX = "custom-gradient-";
const DEFAULT_THEME_ID: ThemeId = "mint-sparkle";
const DEFAULT_BACKGROUND_ID = "gradient-mermaid";
const DEFAULT_FONT_ID: FontId = "sans";

/**
 * 公開ページでプロフィールのテーマ・壁紙・フォントを適用する
 */
export function ProfileThemeApplier({ profile }: { profile: InfluencerProfile | null }) {
  useEffect(() => {
    if (!profile) return;

    const themeId: ThemeId =
      profile.themeId && themes.some((t) => t.id === profile.themeId)
        ? (profile.themeId as ThemeId)
        : DEFAULT_THEME_ID;
    applyTheme(themeId);

    const bgId = profile.backgroundId;
    if (
      bgId &&
      (bgId.startsWith(CUSTOM_COLOR_PREFIX) ||
        bgId.startsWith(CUSTOM_GRADIENT_PREFIX) ||
        backgrounds.some((b) => b.id === bgId))
    ) {
      applyBackground(bgId);
    } else {
      applyBackground(DEFAULT_BACKGROUND_ID);
    }

    const fontId: FontId = profile.fontId && isValidFontId(profile.fontId) ? (profile.fontId as FontId) : DEFAULT_FONT_ID;
    applyFont(fontId);
  }, [profile?.themeId, profile?.backgroundId, profile?.fontId]);

  return null;
}
