"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RecipePlacement } from "@/lib/sections";

const HANDWRITING_FONT = "Yomogi, cursive";
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Yomogi&display=swap";

function buildFallbackLink(p: RecipePlacement): string {
  if (p.link) return p.link;
  if (p.product) return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.product)}/?l-id=cosmetree`;
  return "";
}

function useHandwritingFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_LINK}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }, []);
}

interface RecipeCanvasProps {
  backgroundImage?: string;
  placements: RecipePlacement[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
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
  onBackgroundClick,
  onPinchScale,
}: RecipeCanvasProps) {
  useHandwritingFont();
  const canvasRef = useRef<HTMLDivElement>(null);

  const onPinchScaleRef = useRef(onPinchScale);
  onPinchScaleRef.current = onPinchScale;

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
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground"
          onClick={() => onBackgroundClick?.()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12 opacity-40">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
          </svg>
          <p className="text-sm">タップして顔写真をアップロード</p>
        </div>
      ) : null}

      {placements.map((p) =>
        p.type === "comment" ? (
          <CommentItem
            key={p.id}
            placement={p}
            editable={editable}
            isSelected={selectedId === p.id}
            onSelect={() => onSelect?.(p.id)}
            onMove={(x, y) => onMove?.(p.id, x, y)}
          />
        ) : (
          <PlacementItem
            key={p.id}
            placement={p}
            editable={editable}
            isSelected={selectedId === p.id}
            onSelect={() => onSelect?.(p.id)}
            onMove={(x, y) => onMove?.(p.id, x, y)}
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
          backgroundColor: "rgba(255,255,255,0.6)",
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

    const canvas = (startEvt.currentTarget as HTMLElement).parentElement!;
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

function CommentItem({
  placement,
  editable,
  isSelected,
  onSelect,
  onMove,
}: {
  placement: RecipePlacement;
  editable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const scale = placement.scale ?? 1;
  const color = placement.color || "#333";
  const rotation = placement.rotation ?? 0;
  const handleDrag = useDrag(editable, onSelect, onMove);

  const textStyle: React.CSSProperties = {
    fontFamily: HANDWRITING_FONT,
    color,
    fontSize: `${Math.round(13 * scale)}px`,
    lineHeight: 1.4,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    textShadow: "0 1px 3px rgba(255,255,255,0.8), 0 0 1px rgba(255,255,255,0.6)",
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
        <div className="absolute -inset-1.5 rounded-lg border-2 border-primary/60 bg-primary/5" />
      )}
      <p className="relative select-none" style={textStyle}>
        {placement.comment || "コメント"}
      </p>
    </div>
  );
}

function PlacementItem({
  placement,
  editable,
  isSelected,
  onSelect,
  onMove,
}: {
  placement: RecipePlacement;
  editable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const scale = placement.scale ?? 1;
  const handleDrag = useDrag(editable, onSelect, onMove);

  const labelAlign = placement.x > 75 ? "self-end" : placement.x < 25 ? "self-start" : "self-center";

  const imageElement = placement.image && (
    <div className="relative h-14 w-14 overflow-hidden rounded-lg border-2 border-white/80 bg-white shadow-lg">
      <img
        src={placement.image}
        alt={placement.product || ""}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );

  const labelElement = (placement.brand || placement.product) ? (
    <div className={`w-[100px] ${labelAlign} bg-black/40 px-1.5 py-0.5 text-center backdrop-blur-[2px]`}>
      {placement.brand && (
        <p className="truncate text-[9px] font-bold text-white">{placement.brand}</p>
      )}
      {placement.product && (
        <p className="line-clamp-4 text-[8px] font-medium leading-tight text-white">{placement.product}</p>
      )}
    </div>
  ) : null;

  const effectiveLink = buildFallbackLink(placement);
  if (!editable && effectiveLink) {
    return (
      <a
        href={effectiveLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute z-10 flex flex-col items-center gap-0.5"
        style={{
          left: `${placement.x}%`,
          top: `${placement.y}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {imageElement}
        {labelElement}
      </a>
    );
  }

  return (
    <div
      className={`absolute flex flex-col items-center gap-0.5 ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${isSelected ? "z-20" : "z-10"}`}
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
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
        <div className="absolute -inset-2 rounded-xl border-2 border-primary/60 bg-primary/5" />
      )}
      {imageElement}
      {labelElement}
    </div>
  );
}
