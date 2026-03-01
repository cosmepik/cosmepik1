"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { useDesign } from "@/contexts/design-context";
import { BASE_THEMES } from "@/lib/base-themes";
import { THEMES } from "@/lib/theme";

export function BaseThemeSelector() {
  const { setThemeId } = useTheme();
  const { setCardDesignId, setFontId, baseThemeId, setBaseThemeId } = useDesign();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSelect = (theme: (typeof BASE_THEMES)[0]) => {
    setThemeId(theme.themeId);
    setCardDesignId(theme.cardDesignId);
    setFontId(theme.fontId);
    setBaseThemeId(theme.id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gold-500/50 bg-gold-50/80 py-2 px-3 text-sm font-medium text-gold-700 hover:bg-gold-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="text-base">🎨</span>
        <span>ベーステーマ</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ベーステーマを選択"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(95vw,40rem)] md:max-h-[90vh] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-cream-300 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <div>
                <h2 className="text-lg font-semibold text-stone-800">ベーステーマ</h2>
                <p className="text-sm text-stone-500 mt-0.5">まずはじめにデザインの方向性を選んでください</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -m-2 rounded-lg text-stone-500 hover:bg-cream-200 hover:text-stone-700"
                aria-label="閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BASE_THEMES.map((theme) => {
                  const wallTheme = THEMES.find((t) => t.id === theme.themeId);
                  const isSelected = baseThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelect(theme)}
                      className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected ? "border-gold-500 ring-2 ring-gold-400/50" : "border-cream-300 hover:border-cream-400"
                      }`}
                    >
                      <div
                        className={`h-20 w-full ${wallTheme?.className ?? ""}`}
                        style={wallTheme?.style ?? {}}
                      />
                      <div className="p-3 bg-white border-t border-cream-200">
                        <p className="text-sm font-medium text-stone-800">{theme.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{theme.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
