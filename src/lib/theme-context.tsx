"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { themes, themeVariables, type ThemeId } from "@/lib/themes";
import { backgrounds } from "@/lib/backgrounds";
import { getFontFamily, isValidFontId, type FontId } from "@/lib/fonts";
import { cardDesigns, getCardDesign, type CardDesignId } from "@/lib/card-designs";

const THEME_STORAGE_KEY = "cosmepik-theme";
const BACKGROUND_STORAGE_KEY = "cosmepik-background";
const FONT_STORAGE_KEY = "cosmepik-font";
const CARD_DESIGN_STORAGE_KEY = "cosmepik-card-design";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  backgroundId: string;
  setBackgroundId: (id: string) => void;
  fontId: FontId;
  setFontId: (id: FontId) => void;
  cardDesignId: CardDesignId;
  setCardDesignId: (id: CardDesignId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** 公開ページでプロフィールのテーマを適用するためにエクスポート */
export function applyTheme(themeId: ThemeId) {
  const vars = themeVariables[themeId];
  if (!vars) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
  root.style.setProperty("--green", vars.primary);
}

const CUSTOM_COLOR_PREFIX = "custom-";
const CUSTOM_GRADIENT_PREFIX = "custom-gradient-";

/** 公開ページでプロフィールの壁紙を適用するためにエクスポート */
export function applyBackground(backgroundId: string) {
  const root = document.documentElement;

  root.style.removeProperty("--page-bg");
  root.style.removeProperty("--page-bg-image");

  if (backgroundId.startsWith(CUSTOM_GRADIENT_PREFIX)) {
    const rest = backgroundId.slice(CUSTOM_GRADIENT_PREFIX.length);
    const hexes = rest.split("-").filter((h) => /^#[0-9A-Fa-f]{6}$/.test(h));
    if (hexes.length >= 2) {
      root.style.setProperty("--page-bg", hexes[0]!);
      root.style.setProperty(
        "--page-bg-image",
        `linear-gradient(135deg, ${hexes.join(", ")})`
      );
    }
    return;
  }

  if (backgroundId.startsWith(CUSTOM_COLOR_PREFIX)) {
    const hex = backgroundId.slice(CUSTOM_COLOR_PREFIX.length);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      root.style.setProperty("--page-bg", hex);
    }
    return;
  }

  const bg = backgrounds.find((b) => b.id === backgroundId);
  if (!bg) return;

  if (bg.type === "solid") {
    root.style.setProperty("--page-bg", bg.css);
  } else if (bg.type === "gradient") {
    const bgColorMatch = bg.css.match(/background-color:\s*([^;]+)/);
    const bgImageIdx = bg.css.indexOf("background-image:");
    let bgImageValue = "";
    if (bgImageIdx >= 0) {
      bgImageValue = bg.css
        .slice(bgImageIdx + "background-image:".length)
        .trim()
        .replace(/;\s*$/, "");
    }

    if (bgColorMatch) {
      root.style.setProperty("--page-bg", bgColorMatch[1].trim());
    }
    if (bgImageValue) {
      root.style.setProperty("--page-bg-image", bgImageValue);
    }
  } else if (bg.type === "wallpaper") {
    root.style.setProperty("--page-bg", "#ffffff");
    root.style.setProperty("--page-bg-image", bg.css);
  }
}

const DEFAULT_THEME_ID: ThemeId = "mint-sparkle";
const DEFAULT_BACKGROUND_ID = "gradient-mermaid";
const DEFAULT_FONT_ID: FontId = "sans";
const DEFAULT_CARD_DESIGN_ID: CardDesignId = "default";

/** 公開ページでプロフィールのフォントを適用するためにエクスポート */
export function applyFont(fontId: FontId) {
  const root = document.documentElement;
  root.style.setProperty("--font-body", getFontFamily(fontId));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [backgroundId, setBackgroundIdState] = useState<string>(DEFAULT_BACKGROUND_ID);
  const [fontId, setFontIdState] = useState<FontId>(DEFAULT_FONT_ID);
  const [cardDesignId, setCardDesignIdState] = useState<CardDesignId>(DEFAULT_CARD_DESIGN_ID);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (storedTheme && themes.some((t) => t.id === storedTheme)) {
        setThemeIdState(storedTheme);
        applyTheme(storedTheme);
      } else {
        applyTheme(DEFAULT_THEME_ID);
      }

      const storedBg = localStorage.getItem(BACKGROUND_STORAGE_KEY);
      if (
        storedBg &&
        (storedBg.startsWith(CUSTOM_COLOR_PREFIX) ||
          storedBg.startsWith(CUSTOM_GRADIENT_PREFIX) ||
          backgrounds.some((b) => b.id === storedBg))
      ) {
        setBackgroundIdState(storedBg);
        applyBackground(storedBg);
      } else {
        applyBackground(DEFAULT_BACKGROUND_ID);
      }

      const storedFont = localStorage.getItem(FONT_STORAGE_KEY) as FontId | null;
      if (storedFont && isValidFontId(storedFont)) {
        setFontIdState(storedFont);
        applyFont(storedFont);
      } else {
        applyFont(DEFAULT_FONT_ID);
      }

      const storedCard = localStorage.getItem(CARD_DESIGN_STORAGE_KEY) as CardDesignId | null;
      if (storedCard && cardDesigns.some((c) => c.id === storedCard)) {
        setCardDesignIdState(storedCard);
      }
    } catch {
      applyTheme(DEFAULT_THEME_ID);
      applyBackground(DEFAULT_BACKGROUND_ID);
      applyFont(DEFAULT_FONT_ID);
    }
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    applyTheme(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setBackgroundId = useCallback((id: string) => {
    setBackgroundIdState(id);
    applyBackground(id);
    try {
      localStorage.setItem(BACKGROUND_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setFontId = useCallback((id: FontId) => {
    setFontIdState(id);
    applyFont(id);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setCardDesignId = useCallback((id: CardDesignId) => {
    setCardDesignIdState(id);
    try {
      localStorage.setItem(CARD_DESIGN_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, backgroundId, setBackgroundId, fontId, setFontId, cardDesignId, setCardDesignId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeId: DEFAULT_THEME_ID,
      setThemeId: () => {},
      backgroundId: DEFAULT_BACKGROUND_ID,
      setBackgroundId: () => {},
      fontId: DEFAULT_FONT_ID,
      setFontId: () => {},
      cardDesignId: DEFAULT_CARD_DESIGN_ID,
      setCardDesignId: () => {},
    };
  }
  return ctx;
}

/** 公開ページ用：カードデザインのクラス名を取得 */
export function getCardDesignClasses(cardDesignId: string | undefined) {
  const design = getCardDesign(cardDesignId);
  return { listClassName: design.listClassName, productClassName: design.productClassName };
}
