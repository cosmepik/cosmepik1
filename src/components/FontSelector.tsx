"use client";

import { useState, useRef, useEffect } from "react";
import { useDesign } from "@/contexts/design-context";
import { FONT_OPTIONS } from "@/lib/design-options";

export function FontSelector() {
  const { fontId, setFontId } = useDesign();
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white/80 py-2 px-3 text-sm text-stone-600 hover:bg-cream-200 transition-colors"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="text-base" style={{ fontFamily: "inherit" }}>Aa</span>
        <span>フォント</span>
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
            aria-label="フォントを選択"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(95vw,28rem)] md:max-h-[90dvh] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-cream-300 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h2 className="text-lg font-semibold text-stone-800">フォント</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFontId(opt.id);
                      setOpen(false);
                    }}
                    className={`rounded-xl p-4 border-2 transition-all text-left ${opt.fontClassName} ${
                      fontId === opt.id
                        ? "border-gold-500 ring-2 ring-gold-400/50 bg-cream-50"
                        : "border-cream-300 hover:border-cream-400 hover:bg-cream-50/50"
                    }`}
                  >
                    <p className="text-lg font-medium text-stone-800">愛用コスメ</p>
                    <p className="text-sm text-stone-600 mt-0.5">{opt.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
