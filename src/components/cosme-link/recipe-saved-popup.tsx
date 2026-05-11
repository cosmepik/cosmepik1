"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

/**
 * メイクレシピを画像保存できたときに、画面中央に出すフローティングポップ。
 *
 * - 既存の sonner トーストは画面端に出るため、達成感を強調しづらいので
 *   端末を問わず中央に「保存できたよ！」を一瞬出す UX に統一する。
 * - スマホ（Web Share）でも PC（a タグ download）でも同じ見た目で出る。
 * - 自動で消える（既定 2.4 秒）。
 *
 * 利用例:
 *   const { showSavedPopup, savedPopup } = useRecipeSavedPopup();
 *   ...
 *   if (result.ok) showSavedPopup();
 *   ...
 *   return (<>{...} {savedPopup}</>);
 */
export function useRecipeSavedPopup(durationMs = 2400) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [visible, durationMs]);

  const showSavedPopup = useCallback(() => {
    setVisible(true);
  }, []);

  const savedPopup: ReactNode =
    visible && typeof window !== "undefined"
      ? createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center px-6"
          >
            <div className="duration-200 animate-in fade-in zoom-in-95 flex flex-col items-center gap-3 rounded-2xl bg-foreground/90 px-8 py-6 text-background shadow-2xl backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/15">
                <Check className="h-8 w-8" strokeWidth={3} />
              </div>
              <p className="text-center text-sm font-medium">
                メイクレシピを写真に保存したよ！
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return { showSavedPopup, savedPopup };
}
