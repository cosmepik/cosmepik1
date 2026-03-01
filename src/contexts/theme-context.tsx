"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type ThemeId,
  type Theme,
  THEMES,
  DEFAULT_THEME_ID,
} from "@/lib/theme";

const STORAGE_KEY = "cosmepik_theme";

type ThemeContextValue = {
  themeId: ThemeId;
  theme: Theme;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES.some((t) => t.id === stored)) {
        setThemeIdState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeId: DEFAULT_THEME_ID,
      theme: THEMES[0],
      setThemeId: () => {},
    };
  }
  return ctx;
}
