"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * メイクレシピを画像化している間に、画面中央へ「処理中」オーバーレイを出すフック。
 *
 * - ダウンロードボタンの spinner だけだと、PC のキャプチャに数秒かかったときに
 *   「バグった？」と誤解されやすいので、明示的なプログレスバーを出す。
 * - recipe-download.ts は途中経過コールバックを持たないため、時間経過に応じた
 *   疑似プログレスで「動いている感」を可視化する（ImageProcessingModal と同方針）。
 * - 完了時は 100% まで一瞬上げてからフェードアウト。
 *
 * 利用例:
 *   const { startProgress, finishProgress, cancelProgress, progressOverlay } =
 *     useRecipeDownloadProgress();
 *   ...
 *   startProgress();
 *   try {
 *     const result = await downloadRecipeImage(el, {
 *       onBlobReady: finishProgress, // 共有ダイアログ／DL 直前に閉じる
 *       ...
 *     });
 *   } catch (e) {
 *     cancelProgress();
 *   }
 *   ...
 *   return (<>{...} {progressOverlay}</>);
 */
export function useRecipeDownloadProgress() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const tickerRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);

  const stopTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const clearFinishTimeout = useCallback(() => {
    if (finishTimeoutRef.current !== null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    stopTicker();
    clearFinishTimeout();
    setProgress(0);
    setActive(true);
    const start = performance.now();
    // 時間定数 3.5 秒で 0 → 90% に滑らかに上昇（指数的）。
    // ほとんどのレシピは 1〜3 秒で完了するので、その範囲で 60〜80% まで進む。
    const TIME_CONSTANT_MS = 3500;
    const CEILING = 90;
    tickerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const simulated = CEILING * (1 - Math.exp(-elapsed / TIME_CONSTANT_MS));
      setProgress((prev) => Math.max(prev, simulated));
    }, 80);
  }, [stopTicker, clearFinishTimeout]);

  const finishProgress = useCallback(() => {
    stopTicker();
    setProgress(100);
    clearFinishTimeout();
    // 100% を一瞬見せてから消す（達成感）
    finishTimeoutRef.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
      finishTimeoutRef.current = null;
    }, 280);
  }, [stopTicker, clearFinishTimeout]);

  const cancelProgress = useCallback(() => {
    stopTicker();
    clearFinishTimeout();
    setActive(false);
    setProgress(0);
  }, [stopTicker, clearFinishTimeout]);

  useEffect(() => {
    return () => {
      stopTicker();
      clearFinishTimeout();
    };
  }, [stopTicker, clearFinishTimeout]);

  const progressOverlay: ReactNode =
    active && typeof window !== "undefined"
      ? createPortal(
          <div
            role="status"
            aria-live="polite"
            aria-label="メイクレシピを書き出し中"
            className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center px-6"
          >
            <div className="duration-200 animate-in fade-in zoom-in-95 flex w-full max-w-[260px] flex-col items-center gap-3 rounded-2xl bg-foreground/90 px-6 py-5 text-background shadow-2xl backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/15">
                <Loader2 className="h-7 w-7 animate-spin" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium">
                メイクレシピを書き出し中...
              </p>
              <div className="w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/20">
                  <div
                    className="h-full rounded-full bg-background transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center text-[11px] text-background/70">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return { startProgress, finishProgress, cancelProgress, progressOverlay };
}
