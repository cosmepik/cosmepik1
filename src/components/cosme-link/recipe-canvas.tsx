"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RecipePlacement } from "@/lib/sections";
import { LABEL_DEFAULT } from "@/lib/sections";
import { downloadRecipeImage } from "@/lib/recipe-download";
import { useRecipeSavedPopup } from "./recipe-saved-popup";
import { useRecipeDownloadProgress } from "./recipe-download-progress";

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
  onLabelHide?: (id: string) => void;
  /**
   * ラベル（ブランド + 商品名）テキストの直接編集が確定したとき呼ばれる。
   * ラベル長方形をタップしたインライン編集の完了時に発火する。
   */
  onLabelTextChange?: (id: string, brand: string, product: string) => void;
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
  onLabelHide,
  onLabelTextChange,
  onDelete,
  onBackgroundClick,
  onPinchScale,
}: RecipeCanvasProps) {
  useCommentFont();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { showSavedPopup, savedPopup } = useRecipeSavedPopup();
  const {
    startProgress,
    finishProgress,
    cancelProgress,
    progressOverlay,
  } = useRecipeDownloadProgress();

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
      startProgress();
      try {
        const result = await downloadRecipeImage(el, {
          filename: `cosmepik-recipe-${Date.now()}`,
          shareTitle: "メイクレシピ",
          // 画像生成が終わって共有ダイアログ／DL が始まる直前にプログレスを閉じる
          onBlobReady: finishProgress,
        });
        if (!result.ok) {
          cancelProgress();
          toast.error("画像の保存に失敗しました");
          if (process.env.NODE_ENV !== "production") {
            console.warn("[RecipeCanvas] download failed", result.error);
          }
        } else if (result.method === "share-cancelled") {
          // ユーザーが共有ダイアログをキャンセル → 成功ポップは出さない
        } else {
          showSavedPopup();
        }
      } catch (err) {
        cancelProgress();
        toast.error("画像の保存に失敗しました");
        if (process.env.NODE_ENV !== "production") {
          console.warn("[RecipeCanvas] download error", err);
        }
      } finally {
        setDownloading(false);
      }
    },
    [downloading, editable, onSelect, showSavedPopup, startProgress, finishProgress, cancelProgress],
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
    <>
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
          data-recipe-background="1"
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
            onLabelHide={onLabelHide ? () => onLabelHide(p.id) : undefined}
            onLabelTextChange={
              onLabelTextChange
                ? (brand, product) => onLabelTextChange(p.id, brand, product)
                : undefined
            }
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
    {savedPopup}
    {progressOverlay}
    </>
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
  onLabelHide,
  onLabelTextChange,
}: {
  placement: RecipePlacement;
  editable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onLabelMove: (offsetX: number, offsetY: number) => void;
  onDelete: () => void;
  onLabelHide?: () => void;
  onLabelTextChange?: (brand: string, product: string) => void;
}) {
  const scale = placement.scale ?? 1;
  const labelOffsetX = placement.labelOffsetX ?? LABEL_DEFAULT.offsetX;
  const labelOffsetY = placement.labelOffsetY ?? LABEL_DEFAULT.offsetY;
  const labelScale = placement.labelScale ?? LABEL_DEFAULT.scale;

  // ラベル長方形をタップして商品名を書き換えるためのインライン編集状態。
  // 選択中のアイテムでラベルをタップすると編集モードに入り、完了ボタンで保存して抜ける。
  // ブランド名はここでは編集しない（既存値をそのまま保持する）。
  const [labelEditing, setLabelEditing] = useState(false);
  const [labelDraftProduct, setLabelDraftProduct] = useState(
    placement.product ?? "",
  );
  const productInputRef = useRef<HTMLTextAreaElement | null>(null);

  // 別アイテムが選択されたり、選択解除されたら編集モードを抜ける
  useEffect(() => {
    if (!isSelected || !editable) setLabelEditing(false);
  }, [isSelected, editable]);

  // 編集モード開始時、最新の placement 値を下書きにコピー & 商品名 textarea にフォーカス。
  // 全選択 (select) はせず、カーソルだけ末尾に置く（直感的に追記・修正できるように）。
  useEffect(() => {
    if (!labelEditing) return;
    const initial = placement.product ?? "";
    setLabelDraftProduct(initial);
    const t = window.setTimeout(() => {
      const el = productInputRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        /* iOS Safari で稀に失敗するが致命的ではない */
      }
    }, 0);
    return () => window.clearTimeout(t);
    // placement.id 単位で発火させたいので product そのものは依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelEditing, placement.id]);

  const commitLabelEdit = useCallback(() => {
    if (!onLabelTextChange) {
      setLabelEditing(false);
      return;
    }
    const nextProduct = labelDraftProduct.trim();
    if (nextProduct !== (placement.product ?? "")) {
      // ブランド名は既存値を維持して、商品名だけ更新する
      onLabelTextChange(placement.brand ?? "", nextProduct);
    }
    setLabelEditing(false);
  }, [labelDraftProduct, onLabelTextChange, placement.brand, placement.product]);

  const handleDragImage = useDrag(editable, onSelect, onMove);
  // ラベルドラッグは「ドラッグ先の絶対座標(%)」から画像位置との差分をオフセットに変換
  const handleDragLabel = useDrag(editable, onSelect, (x, y) => {
    onLabelMove(x - placement.x, y - placement.y);
  });

  // brand / product のテキストはあっても、ユーザーが「タイトルを非表示」にしている場合は描画しない
  const hasLabel =
    Boolean(placement.brand || placement.product) && !placement.hideLabel;

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
      // OS 標準の日本語ゴシック体スタックを使う。画面・保存（html-to-image）の
      // 両方で同じシステムフォントが使われるので、文字の太さ・字形が完全に一致する。
      // Noto Sans JP の Web Font 埋め込みは iOS Safari でメモリ不足によるリロードを
      // 引き起こすため避ける（ラベルは 10〜11px の小さいテキストでフォント差は目立たない）。
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif",
      }}
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

      {/* ラベル（独立してドラッグ／リサイズ可能。タップでインライン編集に切り替わる） */}
      {hasLabel && !labelEditing && (
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
            if (!editable) return;
            // すでに選択中のラベルをタップしたら → インライン編集モードに入る
            // （onLabelTextChange ハンドラが渡されていることが前提）
            if (isSelected && onLabelTextChange) {
              setLabelEditing(true);
            } else {
              onSelect();
            }
          }}
        >
          {isSelected && editable && (
            <>
              <div data-editor-decoration="1" className="pointer-events-none absolute -inset-1.5 rounded-md border border-dashed border-primary/70" />
              {onLabelHide && (
                <button
                  type="button"
                  data-editor-decoration="1"
                  className="absolute -left-2 -top-2 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white shadow-md active:scale-90"
                  onClick={(e) => { e.stopPropagation(); onLabelHide(); }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  aria-label="タイトルを非表示にする"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="h-3 w-3">
                    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              )}
            </>
          )}
          {labelContent}
        </div>
      )}

      {/* 編集モード中はラベル長方形の見た目はそのままに、商品名（全文）が見えるフォームを
          ラベル位置にオーバーレイ表示する。ブランド名はここでは編集せず、textarea で長文の
          商品名でも省略せず全部見える形にしている。
          編集ボックス(240px)は max-w-[400px] の canvas からはみ出やすいので、ラベル位置
          (x/y%) に応じて translate と left/top を切り替えて画面内に収まるようにしている。 */}
      {labelEditing && editable && onLabelTextChange && (() => {
        const labelX = placement.x + labelOffsetX;
        const labelY = placement.y + labelOffsetY;
        // 横方向: 左端寄り(<30%) は左基準・右端寄り(>70%) は右基準・それ以外は中央基準。
        // 縦方向: 下端寄り(>60%) はラベルの上に出し、それ以外はラベルの下に出す。
        const isLeft = labelX < 30;
        const isRight = labelX > 70;
        const isBottom = labelY > 60;
        const leftPercent = isLeft ? 4 : isRight ? 96 : labelX;
        const topPercent = labelY;
        const translateX = isLeft ? "0%" : isRight ? "-100%" : "-50%";
        // 下寄りならボックス底辺をラベル上端付近に置く(translateY=-100% + 余白)、
        // それ以外はラベル下端付近に置く(translateY=0% + 余白)。labelScale は反映しない方が
        // 編集中のサイズが安定して扱いやすい。
        const translateY = isBottom ? "calc(-100% - 12px)" : "12px";
        return (
        <div
          data-editor-decoration="1"
          className="absolute z-30"
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            transform: `translate(${translateX}, ${translateY})`,
            touchAction: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="flex w-[240px] flex-col gap-1.5 rounded-lg bg-white p-2 shadow-xl ring-2 ring-primary/70"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif",
            }}
          >
            <textarea
              ref={productInputRef}
              value={labelDraftProduct}
              onChange={(e) => setLabelDraftProduct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLabelEditing(false);
                }
              }}
              placeholder="商品名"
              rows={3}
              className="w-full min-w-0 resize-none rounded border border-input bg-white px-2 py-1.5 text-[12px] font-medium leading-snug text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setLabelEditing(false)}
                className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground active:scale-95"
              >
                やめる
              </button>
              <button
                type="button"
                onClick={commitLabelEdit}
                className="flex items-center gap-0.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground active:scale-95"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
                完了
              </button>
            </div>
          </div>
        </div>
        );
      })()}
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
