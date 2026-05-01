"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Scissors,
  Check,
  X,
  Wand2,
  ImageIcon,
} from "lucide-react";
import {
  blobToDataUrl,
  cropImageToDataUrl,
  fetchImageAsBlob,
  removeImageBackground,
} from "@/lib/image-processing";
import { ManualCropper, type PixelArea } from "./ManualCropper";

type Stage = "choose" | "processing" | "manual";

interface Props {
  isOpen: boolean;
  /** 元画像URL（楽天URL / dataURL / アップロード後URL など） */
  sourceUrl: string;
  onCancel: () => void;
  /** 処理後の data URL（または同一オリジンURL）を返す */
  onConfirm: (processedDataUrl: string) => void;
}

export function ImageProcessingModal({
  isOpen,
  sourceUrl,
  onCancel,
  onConfirm,
}: Props) {
  const [stage, setStage] = useState<Stage>("choose");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [asIsBusy, setAsIsBusy] = useState(false);

  // Manual crop state
  const [croppedPixels, setCroppedPixels] = useState<PixelArea | null>(null);
  const [manualBusy, setManualBusy] = useState(false);

  // onConfirm は親のレンダー毎に参照が変わる可能性があるため ref に保持し、
  // 処理中に再レンダーが起きても useEffect が重複実行されないようにする。
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  });

  // モーダルが開く / 対象画像が変わる度に状態をリセット
  useEffect(() => {
    if (!isOpen) return;
    setStage("choose");
    setProgress(0);
    setError(null);
    setCroppedPixels(null);
    setAsIsBusy(false);
    setManualBusy(false);
  }, [isOpen, sourceUrl]);

  // モーダル表示中は背面のスクロールを止める
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // stage === "processing" に入ったときだけ AI 背景除去を実行する。
  // ユーザーが「背景を除去」ボタンを押すまでは重い処理を走らせない。
  useEffect(() => {
    if (!isOpen || stage !== "processing") return;

    setProgress(0);
    setError(null);

    let cancelled = false;

    // 疑似プログレス: 実コールバックが発火しない / 遅延するケース用に
    // 時間経過で 90% まで指数的に滑らかに上昇させる（減少はしない）。
    const start = performance.now();
    const TIME_CONSTANT_MS = 2500;
    const SIMULATED_CEILING = 90;
    const tickerId = window.setInterval(() => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const simulated =
        SIMULATED_CEILING * (1 - Math.exp(-elapsed / TIME_CONSTANT_MS));
      setProgress((prev) => Math.max(prev, simulated));
    }, 80);

    (async () => {
      try {
        const dataUrl = await removeImageBackground(sourceUrl, (p) => {
          if (cancelled) return;
          setProgress((prev) => Math.max(prev, Math.min(p, 95)));
        });
        if (cancelled) return;
        window.clearInterval(tickerId);
        setProgress(100);
        // 100% 表示を一瞬だけ見せてから親に渡す（視覚的な完了感のため）
        await new Promise((r) => setTimeout(r, 180));
        if (cancelled) return;
        // 新UX: プレビュー画面を挟まず、そのまま親に確定を返す
        onConfirmRef.current(dataUrl);
      } catch (e) {
        console.error("[ImageProcessingModal] bg removal failed", e);
        if (cancelled) return;
        window.clearInterval(tickerId);
        const detail = e instanceof Error ? e.message : String(e);
        setError(
          `背景除去に失敗しました。別の方法を選んでください。\n詳細: ${detail}`,
        );
        setStage("choose");
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(tickerId);
    };
  }, [isOpen, stage, sourceUrl]);

  const handleCropChange = useCallback((area: PixelArea | null) => {
    setCroppedPixels(area);
  }, []);

  const handleManualConfirm = async () => {
    if (!croppedPixels || manualBusy) return;
    setManualBusy(true);
    try {
      const dataUrl = await cropImageToDataUrl(
        sourceUrl,
        croppedPixels,
        "image/png",
      );
      onConfirmRef.current(dataUrl);
    } catch (e) {
      console.error("[ImageProcessingModal] manual crop failed", e);
      setError("切り抜きに失敗しました");
    } finally {
      setManualBusy(false);
    }
  };

  // 「このまま使う」: 元画像をそのまま使う。
  // 外部URLはブラウザ経由で取得して dataURL 化することで、
  // 呼び出し側の Supabase Storage へのアップロードパスに乗せる。
  const handleUseAsIs = async () => {
    if (asIsBusy) return;
    setAsIsBusy(true);
    setError(null);
    try {
      if (sourceUrl.startsWith("data:")) {
        onConfirmRef.current(sourceUrl);
        return;
      }
      const blob = await fetchImageAsBlob(sourceUrl);
      const dataUrl = await blobToDataUrl(blob);
      onConfirmRef.current(dataUrl);
    } catch (e) {
      console.error("[ImageProcessingModal] use as-is failed", e);
      const detail = e instanceof Error ? e.message : String(e);
      setError(`画像の読み込みに失敗しました\n詳細: ${detail}`);
      setAsIsBusy(false);
    }
  };

  if (!isOpen) return null;
  if (typeof window === "undefined") return null;

  // プレビュー表示用URL。
  //  - dataURL / blobURL / 同一オリジン（"/..."を含む）はそのまま
  //  - 外部URLのみ CORS 対策のため /api/img-proxy 経由
  const previewSrc = (() => {
    if (sourceUrl.startsWith("data:") || sourceUrl.startsWith("blob:")) {
      return sourceUrl;
    }
    try {
      const u = new URL(sourceUrl, window.location.href);
      if (u.origin === window.location.origin) return sourceUrl;
    } catch {
      // URL として不正な場合はそのまま渡す
      return sourceUrl;
    }
    return `/api/img-proxy?url=${encodeURIComponent(sourceUrl)}`;
  })();

  const busy = asIsBusy || manualBusy;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-card-foreground">
            {stage === "choose" && "画像の使い方を選択"}
            {stage === "processing" && "画像を処理中..."}
            {stage === "manual" && "切り抜き調整"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-50"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stage === "choose" && (
            <div className="flex flex-col gap-4 p-5">
              {error && (
                <p className="whitespace-pre-wrap break-words rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {error}
                </p>
              )}
              <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-[conic-gradient(at_top_left,_#f3f4f6_25%,_#e5e7eb_25%_50%,_#f3f4f6_50%_75%,_#e5e7eb_75%)] bg-[length:20px_20px]">
                <img
                  src={previewSrc}
                  alt="元画像"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setStage("processing")}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Wand2 className="h-4 w-4" />
                  AIで背景を除去
                </button>
                <button
                  type="button"
                  onClick={() => setStage("manual")}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  <Scissors className="h-4 w-4" />
                  トリミング
                </button>
                <button
                  type="button"
                  onClick={handleUseAsIs}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  {asIsBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 読み込み中...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" /> このまま使う
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="w-full max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {progress < 100
                    ? `AIで背景を除去中 ${Math.round(progress)}%`
                    : "仕上げ中..."}
                </p>
                <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
                  初回のみモデルをダウンロードします（少しお待ちください）
                </p>
              </div>
            </div>
          )}

          {stage === "manual" && (
            <div className="flex flex-col gap-3 p-5">
              {error && (
                <p className="whitespace-pre-wrap break-words rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {error}
                </p>
              )}
              <ManualCropper
                imageUrl={previewSrc}
                onChange={handleCropChange}
                className="mx-auto aspect-square w-full overflow-hidden rounded-xl bg-[conic-gradient(at_top_left,_#f3f4f6_25%,_#e5e7eb_25%_50%,_#f3f4f6_50%_75%,_#e5e7eb_75%)] bg-[length:20px_20px]"
              />
              <p className="text-center text-[11px] text-muted-foreground">
                枠の角・辺をドラッグしてサイズ調整／ピンチで拡大・縮小
              </p>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStage("choose")}
                  disabled={manualBusy}
                  className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
                >
                  戻る
                </button>
                <button
                  type="button"
                  onClick={handleManualConfirm}
                  disabled={!croppedPixels || manualBusy}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {manualBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 処理中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> この範囲で切り抜く
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
