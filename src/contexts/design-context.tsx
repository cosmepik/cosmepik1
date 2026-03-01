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
  type CardDesignId,
  type FontId,
  CARD_DESIGNS,
  FONT_OPTIONS,
  DEFAULT_CARD_DESIGN_ID,
  DEFAULT_FONT_ID,
} from "@/lib/design-options";
import type { BaseThemeId } from "@/lib/base-themes";

const STORAGE_KEY = "cosmetree_design";

type DesignContextValue = {
  cardDesignId: CardDesignId;
  fontId: FontId;
  baseThemeId: BaseThemeId | null;
  setCardDesignId: (id: CardDesignId) => void;
  setFontId: (id: FontId) => void;
  setBaseThemeId: (id: BaseThemeId | null) => void;
  cardClassName: string;
  fontClassName: string;
};

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [cardDesignId, setCardDesignIdState] = useState<CardDesignId>(DEFAULT_CARD_DESIGN_ID);
  const [fontId, setFontIdState] = useState<FontId>(DEFAULT_FONT_ID);
  const [baseThemeId, setBaseThemeIdState] = useState<BaseThemeId | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { card?: CardDesignId; font?: FontId; baseTheme?: BaseThemeId };
        if (parsed.card && CARD_DESIGNS.some((c) => c.id === parsed.card)) {
          setCardDesignIdState(parsed.card);
        }
        if (parsed.font && FONT_OPTIONS.some((f) => f.id === parsed.font)) {
          setFontIdState(parsed.font);
        }
        if (parsed.baseTheme) {
          setBaseThemeIdState(parsed.baseTheme);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCardDesignId = useCallback((id: CardDesignId) => {
    setCardDesignIdState(id);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as { card?: CardDesignId; font?: FontId; baseTheme?: BaseThemeId }) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, card: id }));
    } catch {
      /* ignore */
    }
  }, []);

  const setFontId = useCallback((id: FontId) => {
    setFontIdState(id);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as { card?: CardDesignId; font?: FontId; baseTheme?: BaseThemeId }) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, font: id }));
    } catch {
      /* ignore */
    }
  }, []);

  const setBaseThemeId = useCallback((id: BaseThemeId | null) => {
    setBaseThemeIdState(id);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as { card?: CardDesignId; font?: FontId; baseTheme?: BaseThemeId }) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, baseTheme: id }));
    } catch {
      /* ignore */
    }
  }, []);

  const cardDesign = CARD_DESIGNS.find((c) => c.id === cardDesignId) ?? CARD_DESIGNS[0];
  const fontOption = FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0];

  return (
    <DesignContext.Provider
      value={{
        cardDesignId,
        fontId,
        baseThemeId,
        setCardDesignId,
        setFontId,
        setBaseThemeId,
        cardClassName: cardDesign.cardClassName,
        fontClassName: fontOption.fontClassName,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) {
    const defaultCard = CARD_DESIGNS.find((c) => c.id === DEFAULT_CARD_DESIGN_ID) ?? CARD_DESIGNS[0];
    const defaultFont = FONT_OPTIONS.find((f) => f.id === DEFAULT_FONT_ID) ?? FONT_OPTIONS[0];
    return {
      cardDesignId: DEFAULT_CARD_DESIGN_ID,
      fontId: DEFAULT_FONT_ID,
      baseThemeId: null,
      setCardDesignId: () => {},
      setFontId: () => {},
      setBaseThemeId: () => {},
      cardClassName: defaultCard.cardClassName,
      fontClassName: defaultFont.fontClassName,
    };
  }
  return ctx;
}
