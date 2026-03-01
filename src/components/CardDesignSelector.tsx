"use client";

import { useState, useRef, useEffect } from "react";
import { useDesign } from "@/contexts/design-context";
import { CARD_DESIGNS } from "@/lib/design-options";

export function CardDesignSelector() {
  const { cardDesignId, setCardDesignId, cardClassName } = useDesign();
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
        <span className="w-4 h-4 rounded border border-cream-400 bg-white shadow-sm" />
        <span>カード枠</span>
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
            aria-label="カード枠デザインを選択"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(95vw,36rem)] md:max-h-[90vh] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-cream-300 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h2 className="text-lg font-semibold text-stone-800">カード枠デザイン</h2>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CARD_DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setCardDesignId(design.id);
                      setOpen(false);
                    }}
                    className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                      cardDesignId === design.id
                        ? "border-gold-500 ring-2 ring-gold-400/50"
                        : "border-cream-300 hover:border-cream-400"
                    }`}
                  >
                    <div className={`p-3 ${design.cardClassName}`}>
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded bg-cream-200 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gold-600 font-medium">BRAND</p>
                          <p className="text-[10px] text-stone-700 truncate">商品名</p>
                        </div>
                      </div>
                    </div>
                    <p className="px-3 py-2 text-xs font-medium text-stone-700 bg-cream-50 border-t border-cream-200">
                      {design.name}
                    </p>
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
