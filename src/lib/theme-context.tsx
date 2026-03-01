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

const THEME_STORAGE_KEY = "cosmepik-theme";
const BACKGROUND_STORAGE_KEY = "cosmepik-background";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  backgroundId: string;
  setBackgroundId: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(themeId: ThemeId) {
  const vars = themeVariables[themeId];
  if (!vars) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
  root.style.setProperty("--green", vars.primary);
}

function applyBackground(backgroundId: string) {
  const bg = backgrounds.find((b) => b.id === backgroundId);
  const root = document.documentElement;

  root.style.removeProperty("--page-bg");
  root.style.removeProperty("--page-bg-image");

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [backgroundId, setBackgroundIdState] = useState<string>(DEFAULT_BACKGROUND_ID);

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
      if (storedBg && backgrounds.some((b) => b.id === storedBg)) {
        setBackgroundIdState(storedBg);
        applyBackground(storedBg);
      } else {
        applyBackground(DEFAULT_BACKGROUND_ID);
      }
    } catch {
      applyTheme(DEFAULT_THEME_ID);
      applyBackground(DEFAULT_BACKGROUND_ID);
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

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, backgroundId, setBackgroundId }}>
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
    };
  }
  return ctx;
}
