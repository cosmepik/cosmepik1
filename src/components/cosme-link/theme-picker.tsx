"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { themes } from "@/lib/themes";
import { Palette, Check } from "lucide-react";

type ThemePickerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ThemePickerContext = createContext<ThemePickerContextValue | null>(null);

export function ThemePickerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ThemePickerContext.Provider value={{ open, setOpen }}>
      {children}
    </ThemePickerContext.Provider>
  );
}

export function useThemePickerOpen() {
  const ctx = useContext(ThemePickerContext);
  return ctx
    ? { open: ctx.open, setOpen: ctx.setOpen }
    : { open: false, setOpen: () => {} };
}

export function ThemePicker() {
  const pathname = usePathname();
  const { themeId, setThemeId } = useTheme();
  const ctx = useContext(ThemePickerContext);
  const open = ctx?.open ?? false;
  const setOpen = ctx?.setOpen ?? (() => {});
  const isEditPage = pathname?.startsWith("/dashboard/edit/");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <>
      {/* 編集ページ以外ではフローティングボタン表示 */}
      {!isEditPage && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:opacity-90"
          aria-label="テーマを選択"
        >
          <Palette className="h-6 w-6" />
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="テーマを選択"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-background/95 shadow-xl backdrop-blur-md"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background/95 px-4 py-4 backdrop-blur-md">
              <h2 className="text-lg font-semibold text-foreground">テーマカラー</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {themes.map((theme) => {
                const selected = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setThemeId(theme.id);
                      setOpen(false);
                    }}
                    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-colors ${
                      selected ? "border-primary bg-accent/30" : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex gap-1.5">
                      <span
                        className="h-6 w-6 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.preview.primary }}
                      />
                      <span
                        className="h-6 w-6 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.preview.secondary }}
                      />
                      <span
                        className="h-6 w-6 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{theme.nameJa}</span>
                      {selected && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
