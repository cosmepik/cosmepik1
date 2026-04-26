"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RecipePlacement } from "@/lib/sections";
import { LABEL_DEFAULT } from "@/lib/sections";
import { downloadRecipeImage } from "@/lib/recipe-download";

const COMMENT_FONT = "'HuiFontP29', cursive";

function useCommentFont() {
  useEffect(() => {
    if (document.querySelector("style[data-hui-font]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-hui-font", "");
    style.textContent = `@font-face { font-family: 'HuiFontP29'; src: url('/fonts/HuiFontP29.ttf') format('truetype'); font-display: swap; }`;
    document.head.appendChild(style);
  }, []);
}

function buildFallbackLink(p: RecipePlacement): string {
  if (p.link) return p.link;
  if (p.product) return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.product)}/?l-id=cosmetree`;
  return "";
}

interface RecipeCanvasProps {
  backgroundImage?: string;
  placements: RecipePlacement[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onLabelMove?: (id: string, offsetX: number, offsetY: number) => void;
  onDelete?: (id: string) => void;
  onBackgroundClick?: () => void;
  onPinchScale?: (delta: number) => void;
}

export function RecipeCanvas({
  backgroundImage,
  placements,
  editable = false,
  selectedId,
  onSelect,
  onMove,
  onLabelMove,
  onDelete,
  onBackgroundClick,
  onPinchScale,
}: RecipeCanvasProps) {
  useCommentFont();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const onPinchScaleRef = useRef(onPinchScale);
  onPinchScaleRef.current = onPinchScale;

  // 画像保存処理。クリック時のみ html-to-image を動的 import するので
  // 通常のページロードには影響しない。
  // Web Share API があれば iOS Safari で写真アプリへの保存にも対応する。
  const handleDownload = useCallback(
    async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (downloading) return;
      const el = canvasRef.current;
      if (!el) return;
      // 編集中の選択を解除して、選択枠が画像に写り込まないようにする
      if (editable) onSelect?.(null);
      setDownloading(true);
      try {
        const result = await downloadRecipeImage(el, {
          filename: `cosmepik-recipe-${Date.now()}`,
          shareTitle: "メイクレシピ",
        });
        if (!result.ok) {
          toast.error("画像の保存に失敗しました");
          if (process.env.NODE_ENV !== "production") {
            console.warn("[RecipeCanvas] download failed", result.error);
          }
        } else if (result.method === "download") {
          toast.success("メイクレシピを保存しました");
        }
        // share / newtab の場合は OS のシートやタブが出るので追加トーストは不要
      } catch (err) {
        toast.error("画像の保存に失敗しました");
        if (process.env.NODE_ENV !== "production") {
          console.warn("[RecipeCanvas] download error", err);
        }
      } finally {
        setDownloading(false);
      }
    },
    [downloading, editable, onSelect],
  );

  const showDownloadButton = Boolean(backgroundImage) || placements.length > 0;

  useEffect(() => {
    if (!editable) return;
    const el = canvasRef.current;
    if (!el) return;

    let initialDistance = 0;

    const getDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const dist = getDistance(e.touches[0], e.touches[1]);
        const ratio = dist / initialDistance;
        const delta = (ratio - 1) * 0.3;
        initialDistance = dist;
        if (Math.abs(delta) > 0.005) {
          onPinchScaleRef.current?.(delta);
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [editable]);

  if (!editable && !backgroundImage && placements.length === 0) return null;

  return (
    <div
      ref={canvasRef}
      data-recipe-canvas
      className="relative w-full overflow-hidden bg-muted/30"
      style={{ aspectRatio: "3 / 4", touchAction: editable ? "pan-y" : undefined }}
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt="メイクレシピ背景"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          onClick={() => {
            if (editable && selectedId) {
              onSelect?.(null);
            }
          }}
        />
      ) : editable ? (
        <div
          data-editor-decoration="1"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground"
          onClick={() => onBackgroundClick?.()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12 opacity-40">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
          </svg>
          <p className="text-sm">タップして顔写真をアップロード</p>
        </div>
      ) : null}

      {/* ダウンロードボタン（右上）。data-editor-decoration を付けて画像化対象から除外 */}
      {showDownloadButton && (
        <button
          type="button"
          data-editor-decoration="1"
          aria-label="メイクレシピを画像で保存"
          onClick={handleDownload}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          disabled={downloading}
          className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/75 active:scale-95 disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Download className="h-[18px] w-[18px]" />
          )}
        </button>
      )}

      {placements.map((p) =>
        p.type === "comment" ? (
          <CommentItem
            key={p.id}
            placement={p}
            editable={editable}
            isSelected={selectedId === p.id}
            onSelect={() => onSelect?.(p.id)}
            onMove={(x, y) => onMove?.(p.id, x, y)}
            onDelete={() => onDelete?.(p.id)}
          />
        ) : (
          <PlacementItem
            key={p.id}
            placement={p}
            editable={editable}
            isSelected={selectedId === p.id}
            onSelect={() => onSelect?.(p.id)}
            onMove={(x, y) => onMove?.(p.id, x, y)}
            onLabelMove={(ox, oy) => onLabelMove?.(p.id, ox, oy)}
            onDelete={() => onDelete?.(p.id)}
          />
        ),
      )}

      {/* cosmepik ロゴ */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2"
        style={{
          width: 112,
          height: 28,
          backgroundColor: "#ffffff",
          maskImage: "url(/logo.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: "url(/logo.svg)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />

    </div>
  );
}

function useDrag(
  editable: boolean,
  onSelect: () => void,
  onMove: (x: number, y: number) => void,
) {
  return (startEvt: React.TouchEvent | React.MouseEvent) => {
    if (!editable) return;
    startEvt.preventDefault();
    startEvt.stopPropagation();
    onSelect();

    // canvas は祖先のどこか（画像／ラベルが別ラッパーになった為、直近の親とは限らない）
    const canvas = (startEvt.currentTarget as HTMLElement).closest<HTMLElement>(
      "[data-recipe-canvas]",
    );
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const getClientPos = (e: TouchEvent | MouseEvent) => {
      if ("touches" in e && e.touches.length > 0)
        return { cx: e.touches[0].clientX, cy: e.touches[0].clientY };
      if ("clientX" in e) return { cx: e.clientX, cy: e.clientY };
      return null;
    };

    const onDragMove = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      const pos = getClientPos(e);
      if (!pos) return;
      const x = Math.max(0, Math.min(100, ((pos.cx - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((pos.cy - rect.top) / rect.height) * 100));
      onMove(x, y);
    };

    const onDragEnd = () => {
      document.removeEventListener("touchmove", onDragMove);
      document.removeEventListener("touchend", onDragEnd);
      document.removeEventListener("mousemove", onDragMove);
      document.removeEventListener("mouseup", onDragEnd);
    };

    document.addEventListener("touchmove", onDragMove, { passive: false });
    document.addEventListener("touchend", onDragEnd);
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  };
}

function PlacementItem({
  placement,
  editable,
  isSelected,
  onSelect,
  onMove,
  onLabelMove,
  onDelete,
}: {
  placement: RecipePlacement;
  editable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onLabelMove: (offsetX: number, offsetY: number) => void;
  onDelete: () => void;
}) {
  const scale = placement.scale ?? 1;
  const labelOffsetX = placement.labelOffsetX ?? LABEL_DEFAULT.offsetX;
  const labelOffsetY = placement.labelOffsetY ?? LABEL_DEFAULT.offsetY;
  const labelScale = placement.labelScale ?? LABEL_DEFAULT.scale;

  const handleDragImage = useDrag(editable, onSelect, onMove);
  // ラベルドラッグは「ドラッグ先の絶対座標(%)」から画像位置との差分をオフセットに変換
  const handleDragLabel = useDrag(editable, onSelect, (x, y) => {
    onLabelMove(x - placement.x, y - placement.y);
  });

  const hasLabel = Boolean(placement.brand || placement.product);

  const imageElement = placement.image ? (
    <img
      src={placement.image}
      alt={placement.product || ""}
      className="h-full w-full object-contain"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
      draggable={false}
    />
  ) : null;

  const labelContent = (
    <div
      className="w-[120px] bg-black/40 px-1.5 py-0.5 text-center backdrop-blur-[2px]"
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {placement.brand && (
        <p className="truncate text-[11px] font-bold text-white">{placement.brand}</p>
      )}
      {placement.product && (
        <p className="line-clamp-4 text-[10px] font-medium leading-tight text-white">{placement.product}</p>
      )}
    </div>
  );

  const effectiveLink = buildFallbackLink(placement);

  // 公開ビュー（編集不可かつリンクあり）：画像とラベルそれぞれをリンク化
  if (!editable && effectiveLink) {
    return (
      <>
        {imageElement && (
          <a
            href={effectiveLink}
            target="_blank"
            rel="noopener noreferrer"
            data-afl={effectiveLink}
            data-item-id={placement.id}
            className="absolute z-10 block h-20 w-20"
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            {imageElement}
          </a>
        )}
        {hasLabel && (
          <a
            href={effectiveLink}
            target="_blank"
            rel="noopener noreferrer"
            data-afl={effectiveLink}
            data-item-id={placement.id}
            className="absolute z-10 block"
            style={{
              left: `${placement.x + labelOffsetX}%`,
              top: `${placement.y + labelOffsetY}%`,
              transform: `translate(-50%, -50%) scale(${labelScale})`,
            }}
          >
            {labelContent}
          </a>
        )}
      </>
    );
  }

  // 編集ビュー：画像とラベルを別々にドラッグ可能な絶対配置要素として描画
  return (
    <>
      {/* 画像 */}
      {imageElement && (
        <div
          className={`absolute flex items-center justify-center ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${isSelected ? "z-20" : "z-10"}`}
          style={{
            left: `${placement.x}%`,
            top: `${placement.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            touchAction: editable ? "none" : undefined,
          }}
          onTouchStart={handleDragImage}
          onMouseDown={handleDragImage}
          onClick={(e) => {
            e.stopPropagation();
            if (editable) onSelect();
          }}
        >
          {isSelected && editable && (
            <>
              <div data-editor-decoration="1" className="pointer-events-none absolute -inset-2 rounded-xl border-2 border-primary/60 bg-primary/5" />
              <button
                type="button"
                data-editor-decoration="1"
                className="absolute -left-3 -top-3 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white shadow-md active:scale-90"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                onTouchStart={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-3 w-3">
                  <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </>
          )}
          <div className="relative h-20 w-20">{imageElement}</div>
        </div>
      )}

      {/* ラベル（独立してドラッグ／リサイズ可能） */}
      {hasLabel && (
        <div
          className={`absolute ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${isSelected ? "z-20" : "z-10"}`}
          style={{
            left: `${placement.x + labelOffsetX}%`,
            top: `${placement.y + labelOffsetY}%`,
            transform: `translate(-50%, -50%) scale(${labelScale})`,
            touchAction: editable ? "none" : undefined,
          }}
          onTouchStart={handleDragLabel}
          onMouseDown={handleDragLabel}
          onClick={(e) => {
            e.stopPropagation();
            if (editable) onSelect();
          }}
        >
          {isSelected && editable && (
            <div data-editor-decoration="1" className="pointer-events-none absolute -inset-1.5 rounded-md border border-dashed border-primary/70" />
          )}
          {labelContent}
        </div>
      )}
    </>
  );
}

function CommentItem({
  placement,
  editable,
  isSelected,
  onSelect,
  onMove,
  onDelete,
}: {
  placement: RecipePlacement;
  editable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
}) {
  const scale = placement.scale ?? 1;
  const color = placement.color || "#333";
  const handleDrag = useDrag(editable, onSelect, onMove);

  const textStyle: React.CSSProperties = {
    fontFamily: COMMENT_FONT,
    color,
    fontSize: `${Math.round(20 * scale)}px`,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div
      className={`absolute z-10 max-w-[60%] ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${isSelected ? "z-20" : ""}`}
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: "translate(-50%, -50%)",
        touchAction: editable ? "none" : undefined,
      }}
      onTouchStart={handleDrag}
      onMouseDown={handleDrag}
      onClick={(e) => {
        e.stopPropagation();
        if (editable) onSelect();
      }}
    >
      {isSelected && editable && (
        <>
          <div data-editor-decoration="1" className="absolute -inset-1.5 rounded-lg border-2 border-primary/60 bg-primary/5" />
          <button
            type="button"
            data-editor-decoration="1"
            className="absolute -left-3 -top-3 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white shadow-md active:scale-90"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-3 w-3">
              <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </>
      )}
      <p style={placement.comment ? textStyle : { ...textStyle, color: "#9ca3af" }}>{placement.comment || "コメントを入力"}</p>
    </div>
  );
}
