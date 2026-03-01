"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";

export function ThemeSelector() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-white py-2 px-3 text-sm text-foreground hover:bg-accent transition-colors"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="w-4 h-4 rounded border border-border bg-secondary" style={{ background: "linear-gradient(135deg, #e8f5f0 0%, #d4edda 100%)" }} />
        <span>壁紙</span>
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
            aria-label="テーマを選択"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(95vw,24rem)] z-50 flex flex-col bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">テーマ</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -m-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">現在はデフォルトのみです。</p>
              <div className="rounded-xl border-2 border-green bg-secondary/30 p-4">
                <p className="text-sm font-medium text-foreground">{theme.name}</p>
                <p className="text-xs text-muted-foreground mt-1">選択中</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
