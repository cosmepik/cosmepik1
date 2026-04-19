"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, Sparkles, Scissors, Check, X } from "lucide-react";
import {
  cropImageToDataUrl,
  removeImageBackground,
} from "@/lib/image-processing";

type Stage = "processing" | "preview" | "manual";

interface Props {
  isOpen: boolean;
  /** 元画像URL（楽天URL / dataURL / アップロード後URL など） */
  sourceUrl: string;
  onCancel: () => void;
  /** 処理後の data URL を返す */
  onConfirm: (processedDataUrl: string) => void;
}

export function ImageProcessingModal({
  isOpen,
  sourceUrl,
  onCancel,
  onConfirm,
}: Props) {
  const [stage, setStage] = useState<Stage>("processing");
  const [progress, setProgress] = useState(0);
  const [autoResult, setAutoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [manualBusy, setManualBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStage("processing");
    setProgress(0);
    setAutoResult(null);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);

    let cancelled = false;
    (async () => {
      try {
        const dataUrl = await removeImageBackground(sourceUrl, (p) => {
          if (!cancelled) setProgress(p);
        });
        if (cancelled) return;
        setAutoResult(dataUrl);
        setStage("preview");
      } catch (e) {
        console.error("[ImageProcessingModal] auto removal failed", e);
        if (cancelled) return;
        const detail = e instanceof Error ? e.message : String(e);
        setError(`自動処理に失敗しました。手動で調整してください。\n詳細: ${detail}`);
        setStage("manual");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, sourceUrl]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onCropComplete = useCallback(
    (_area: Area, areaPixels: Area) => {
      setCroppedPixels(areaPixels);
    },
    [],
  );

  const handleManualConfirm = async () => {
    if (!croppedPixels) return;
    setManualBusy(true);
    try {
      const cropSource = autoResult ?? sourceUrl;
      const dataUrl = await cropImageToDataUrl(cropSource, croppedPixels, "image/png");
      onConfirm(dataUrl);
    } catch (e) {
      console.error("[ImageProcessingModal] manual crop failed", e);
      setError("切り抜きに失敗しました");
    } finally {
      setManualBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-card-foreground">
            {stage === "processing" && "画像を処理中..."}
            {stage === "preview" && "背景を消しました"}
            {stage === "manual" && "切り抜き調整"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-accent"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stage === "processing" && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="w-full max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {progress < 100 ? `AIで背景を除去中 ${progress}%` : "仕上げ中..."}
                </p>
                <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
                  初回のみモデルをダウンロードします（少しお待ちください）
                </p>
              </div>
            </div>
          )}

          {stage === "preview" && autoResult && (
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> 自動で背景を除去しました
              </div>
              <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-[conic-gradient(at_top_left,_#f3f4f6_25%,_#e5e7eb_25%_50%,_#f3f4f6_50%_75%,_#e5e7eb_75%)] bg-[length:20px_20px]">
                <img src={autoResult} alt="処理後プレビュー" className="absolute inset-0 h-full w-full object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onConfirm(autoResult)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  このまま使う
                </button>
                <button
                  type="button"
                  onClick={() => setStage("manual")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <Scissors className="h-4 w-4" />
                  手動で調整
                </button>
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
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-[conic-gradient(at_top_left,_#f3f4f6_25%,_#e5e7eb_25%_50%,_#f3f4f6_50%_75%,_#e5e7eb_75%)] bg-[length:20px_20px]">
                <Cropper
                  image={(() => {
                    const src = autoResult ?? sourceUrl;
                    return src.startsWith("data:") || src.startsWith("blob:")
                      ? src
                      : `/api/image-proxy?url=${encodeURIComponent(src)}`;
                  })()}
                  crop={crop}
                  zoom={zoom}
                  aspect={undefined}
                  showGrid
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  restrictPosition={false}
                  objectFit="contain"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">ズーム</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleManualConfirm}
                disabled={!croppedPixels || manualBusy}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {manualBusy ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 処理中...</>
                ) : (
                  <><Check className="h-4 w-4" /> この範囲で切り抜く</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
