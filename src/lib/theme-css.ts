/**
 * サーバーコンポーネント専用：テーマ・背景・フォントの CSS 変数を
 * インラインスタイルとして生成し、HTML だけでテーマ適用を完結させる。
 */
import { themeVariables, themes, type ThemeId } from "@/lib/themes";
import { backgrounds } from "@/lib/backgrounds";
import { getFontFamily, isValidFontId, type FontId } from "@/lib/fonts";
import type { InfluencerProfile } from "@/types";

const CUSTOM_COLOR_PREFIX = "custom-";
const CUSTOM_GRADIENT_PREFIX = "custom-gradient-";
const DEFAULT_THEME_ID: ThemeId = "mint-sparkle";
const DEFAULT_BACKGROUND_ID = "gradient-mermaid";
const DEFAULT_FONT_ID: FontId = "noto-sans";

function resolveThemeId(profile: InfluencerProfile): ThemeId {
  if (profile.themeId && themes.some((t) => t.id === profile.themeId)) {
    return profile.themeId as ThemeId;
  }
  return DEFAULT_THEME_ID;
}

function resolveBackgroundId(profile: InfluencerProfile): string {
  const bgId = profile.backgroundId;
  if (
    bgId &&
    (bgId.startsWith(CUSTOM_COLOR_PREFIX) ||
      bgId.startsWith(CUSTOM_GRADIENT_PREFIX) ||
      backgrounds.some((b) => b.id === bgId))
  ) {
    return bgId;
  }
  return DEFAULT_BACKGROUND_ID;
}

function resolveFontId(profile: InfluencerProfile): FontId {
  if (profile.fontId && isValidFontId(profile.fontId)) {
    return profile.fontId as FontId;
  }
  return DEFAULT_FONT_ID;
}

/** CSS 変数の Record を返す（wrapper div の style に直接渡す） */
export function generateThemeVars(profile: InfluencerProfile | null): Record<string, string> {
  if (!profile) return {};
  const vars: Record<string, string> = {};

  const themeId = resolveThemeId(profile);
  const tv = themeVariables[themeId];
  if (tv) {
    for (const [key, value] of Object.entries(tv)) {
      vars[`--${key}`] = value;
    }
    vars["--green"] = tv.primary;
  }

  const bgId = resolveBackgroundId(profile);
  if (bgId.startsWith(CUSTOM_GRADIENT_PREFIX)) {
    const rest = bgId.slice(CUSTOM_GRADIENT_PREFIX.length);
    const hexes = rest.split("-").filter((h) => /^#[0-9A-Fa-f]{6}$/.test(h));
    if (hexes.length >= 2) {
      vars["--page-bg"] = hexes[0];
      vars["--page-bg-image"] = `linear-gradient(135deg, ${hexes.join(", ")})`;
    }
  } else if (bgId.startsWith(CUSTOM_COLOR_PREFIX)) {
    const hex = bgId.slice(CUSTOM_COLOR_PREFIX.length);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      vars["--page-bg"] = hex;
    }
  } else {
    const bg = backgrounds.find((b) => b.id === bgId);
    if (bg) {
      if (bg.type === "solid") {
        vars["--page-bg"] = bg.css;
      } else if (bg.type === "gradient") {
        const bgColorMatch = bg.css.match(/background-color:\s*([^;]+)/);
        const bgImageIdx = bg.css.indexOf("background-image:");
        if (bgColorMatch) vars["--page-bg"] = bgColorMatch[1].trim();
        if (bgImageIdx >= 0) {
          vars["--page-bg-image"] = bg.css
            .slice(bgImageIdx + "background-image:".length)
            .trim()
            .replace(/;\s*$/, "");
        }
      } else if (bg.type === "wallpaper") {
        vars["--page-bg"] = "#ffffff";
        vars["--page-bg-image"] = bg.css;
      }
    }
  }

  const fontId = resolveFontId(profile);
  vars["--font-body"] = getFontFamily(fontId);

  if (profile.textColor) {
    vars["--foreground"] = profile.textColor;
    vars["--card-foreground"] = profile.textColor;
  }

  return vars;
}

const FONT_URL_MAP: Partial<Record<FontId, string>> = {
  rounded: "M+PLUS+Rounded+1c:wght@400;500;700",
  mincho: "Shippori+Mincho:wght@400;500;600;700",
  serif: "Cormorant+Garamond:wght@400;500;600;700",
  shippori: "Shippori+Mincho:wght@400;500;600;700",
  zen: "Zen+Kaku+Gothic+New:wght@400;500;700",
  "zen-maru": "Zen+Maru+Gothic:wght@400;500;700",
  "mplus-rounded": "M+PLUS+Rounded+1c:wght@400;500;700",
  kosugi: "Kosugi+Maru",
  "noto-serif": "Noto+Serif+JP:wght@400;500;600;700",
};

/** 必要な場合だけ Google Fonts の URL を返す（sans/noto-sans は root layout で既読み込み済み） */
export function getFontLinkUrl(profile: InfluencerProfile | null): string | null {
  if (!profile) return null;
  const fontId = resolveFontId(profile);
  const param = FONT_URL_MAP[fontId];
  if (!param) return null;
  return `https://fonts.googleapis.com/css2?family=${param}&display=swap`;
}
