"use client";

/**
 * 自由な矩形（アスペクト比フリー）で切り抜き範囲を指定でき、
 * スマホのピンチで画像をズーム／パンできるカスタム・クロッパー。
 *
 * - 画像: object-fit:contain で最初はコンテナにフィットし、ピンチで拡大・ドラッグで移動
 * - 切り抜き枠: 4 隅 + 4 辺のハンドルでサイズ変更、枠内ドラッグで移動
 * - 出力: onChange で画像ナチュラルピクセル単位の切り抜き領域を通知
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";

export type PixelArea = { x: number; y: number; width: number; height: number };

type CropRect = { x: number; y: number; w: number; h: number };
type Handle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

type Interaction =
  | {
      kind: "pan";
      pointerId: number;
      startX: number;
      startY: number;
      startTx: number;
      startTy: number;
    }
  | {
      kind: "pinch";
      ids: [number, number];
      startDist: number;
      startScale: number;
      startTx: number;
      startTy: number;
      startMid: { x: number; y: number };
    }
  | {
      kind: "crop-move";
      pointerId: number;
      startX: number;
      startY: number;
      startCrop: CropRect;
    }
  | {
      kind: "crop-resize";
      pointerId: number;
      handle: Handle;
      startX: number;
      startY: number;
      startCrop: CropRect;
    };

const MIN_CROP = 24; // px (container coords)
const MIN_SCALE = 1;
const MAX_SCALE = 6;

interface Props {
  imageUrl: string;
  onChange: (area: PixelArea | null) => void;
  /** 画像のアスペクト比に関わらずコンテナ自体のアスペクト比（正方形推奨）*/
  className?: string;
}

export function ManualCropper({ imageUrl, onChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  // 画像トランスフォーム（1.0 = contain-fit した状態）
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // 切り抜き枠（コンテナ座標系）
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // アクティブ・ポインタとインタラクション
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const interactionRef = useRef<Interaction | null>(null);

  // コンテナサイズの追跡
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 画像ロード
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // contain-fit レンダリング寸法
  const fit = useMemo(() => {
    if (!containerSize.w || !containerSize.h || !natural.w || !natural.h) {
      return { rw: 0, rh: 0, ox: 0, oy: 0 };
    }
    const s = Math.min(containerSize.w / natural.w, containerSize.h / natural.h);
    const rw = natural.w * s;
    const rh = natural.h * s;
    return {
      rw,
      rh,
      ox: (containerSize.w - rw) / 2,
      oy: (containerSize.h - rh) / 2,
    };
  }, [containerSize, natural]);

  // 実際に表示されている画像の矩形（コンテナ座標系）
  const imageRect = useMemo(() => {
    const w = fit.rw * scale;
    const h = fit.rh * scale;
    // scale はコンテナ中心起点で拡大し、その上に translate を足す
    const cx = containerSize.w / 2 + translate.x;
    const cy = containerSize.h / 2 + translate.y;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }, [fit.rw, fit.rh, scale, translate.x, translate.y, containerSize.w, containerSize.h]);

  // 初期化: natural / container が揃ったタイミングで crop を画像領域の 80% に初期化
  useEffect(() => {
    if (!fit.rw || !fit.rh) return;
    if (crop.w > 0 && crop.h > 0) return; // 既に初期化済み
    const w = fit.rw * 0.8;
    const h = fit.rh * 0.8;
    setCrop({
      x: (containerSize.w - w) / 2,
      y: (containerSize.h - h) / 2,
      w,
      h,
    });
  }, [fit.rw, fit.rh, containerSize.w, containerSize.h, crop.w, crop.h]);

  // crop / imageRect 変化 → 親へ通知（ナチュラルピクセル）
  useEffect(() => {
    if (!natural.w || !natural.h || !imageRect.w || !imageRect.h || !crop.w || !crop.h) {
      return;
    }
    // crop と imageRect の交差
    const left = Math.max(crop.x, imageRect.x);
    const top = Math.max(crop.y, imageRect.y);
    const right = Math.min(crop.x + crop.w, imageRect.x + imageRect.w);
    const bottom = Math.min(crop.y + crop.h, imageRect.y + imageRect.h);
    const iw = right - left;
    const ih = bottom - top;
    if (iw <= 1 || ih <= 1) {
      onChange(null);
      return;
    }
    const px = (left - imageRect.x) / imageRect.w;
    const py = (top - imageRect.y) / imageRect.h;
    const pw = iw / imageRect.w;
    const ph = ih / imageRect.h;
    onChange({
      x: Math.round(px * natural.w),
      y: Math.round(py * natural.h),
      width: Math.round(pw * natural.w),
      height: Math.round(ph * natural.h),
    });
  }, [crop, imageRect, natural.w, natural.h, onChange]);

  // ------- ポインタ処理 -------
  const clampCrop = useCallback(
    (c: CropRect): CropRect => {
      const cw = containerSize.w;
      const ch = containerSize.h;
      let { x, y, w, h } = c;
      w = Math.max(MIN_CROP, Math.min(w, cw));
      h = Math.max(MIN_CROP, Math.min(h, ch));
      x = Math.max(0, Math.min(x, cw - w));
      y = Math.max(0, Math.min(y, ch - h));
      return { x, y, w, h };
    },
    [containerSize.w, containerSize.h],
  );

  const getLocal = (e: RPointerEvent<HTMLElement> | PointerEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const handleImagePointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    const p = getLocal(e);
    pointersRef.current.set(e.pointerId, p);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ids = Array.from(pointersRef.current.keys()) as [number, number];
      interactionRef.current = {
        kind: "pinch",
        ids,
        startDist: dist,
        startScale: scale,
        startTx: translate.x,
        startTy: translate.y,
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
    } else if (pointersRef.current.size === 1) {
      interactionRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        startX: p.x,
        startY: p.y,
        startTx: translate.x,
        startTy: translate.y,
      };
    }
  };

  const handleCropBodyPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    // 2 本目の指はピンチに昇格させる
    const p = getLocal(e);
    pointersRef.current.set(e.pointerId, p);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ids = Array.from(pointersRef.current.keys()) as [number, number];
      interactionRef.current = {
        kind: "pinch",
        ids,
        startDist: dist,
        startScale: scale,
        startTx: translate.x,
        startTy: translate.y,
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
    } else {
      interactionRef.current = {
        kind: "crop-move",
        pointerId: e.pointerId,
        startX: p.x,
        startY: p.y,
        startCrop: crop,
      };
    }
    e.stopPropagation();
  };

  const handleHandlePointerDown = (handle: Handle) => (e: RPointerEvent<HTMLDivElement>) => {
    const p = getLocal(e);
    pointersRef.current.set(e.pointerId, p);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    interactionRef.current = {
      kind: "crop-resize",
      pointerId: e.pointerId,
      handle,
      startX: p.x,
      startY: p.y,
      startCrop: crop,
    };
    e.stopPropagation();
  };

  const handlePointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    const p = getLocal(e);
    pointersRef.current.set(e.pointerId, p);

    const it = interactionRef.current;
    if (!it) return;

    if (it.kind === "pinch") {
      const a = pointersRef.current.get(it.ids[0]);
      const b = pointersRef.current.get(it.ids[1]);
      if (!a || !b) return;
      const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, it.startScale * (dist / it.startDist)),
      );
      // ピンチ中心の移動に合わせて translate も動かす（自然なパン）
      const tx = it.startTx + (mid.x - it.startMid.x);
      const ty = it.startTy + (mid.y - it.startMid.y);
      setScale(nextScale);
      setTranslate({ x: tx, y: ty });
      return;
    }

    if (it.kind === "pan" && it.pointerId === e.pointerId) {
      setTranslate({
        x: it.startTx + (p.x - it.startX),
        y: it.startTy + (p.y - it.startY),
      });
      return;
    }

    if (it.kind === "crop-move" && it.pointerId === e.pointerId) {
      const dx = p.x - it.startX;
      const dy = p.y - it.startY;
      setCrop(
        clampCrop({
          x: it.startCrop.x + dx,
          y: it.startCrop.y + dy,
          w: it.startCrop.w,
          h: it.startCrop.h,
        }),
      );
      return;
    }

    if (it.kind === "crop-resize" && it.pointerId === e.pointerId) {
      const dx = p.x - it.startX;
      const dy = p.y - it.startY;
      const s = it.startCrop;
      let x = s.x;
      let y = s.y;
      let w = s.w;
      let h = s.h;
      // 横方向
      if (it.handle.includes("w")) {
        x = s.x + dx;
        w = s.w - dx;
      } else if (it.handle.includes("e")) {
        w = s.w + dx;
      }
      // 縦方向
      if (it.handle.includes("n")) {
        y = s.y + dy;
        h = s.h - dy;
      } else if (it.handle.includes("s")) {
        h = s.h + dy;
      }
      // 最小サイズ制限（反転しそうな場合は端を固定）
      if (w < MIN_CROP) {
        if (it.handle.includes("w")) x = s.x + s.w - MIN_CROP;
        w = MIN_CROP;
      }
      if (h < MIN_CROP) {
        if (it.handle.includes("n")) y = s.y + s.h - MIN_CROP;
        h = MIN_CROP;
      }
      setCrop(clampCrop({ x, y, w, h }));
    }
  };

  const handlePointerUpOrCancel = (e: RPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2 && interactionRef.current?.kind === "pinch") {
      interactionRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      interactionRef.current = null;
    }
  };

  // ------- レンダリング -------
  const handleStyle =
    "absolute h-5 w-5 rounded-full bg-white border-2 border-primary shadow-md touch-none";
  const edgeHandleStyle =
    "absolute rounded-full bg-white border-2 border-primary/90 shadow touch-none";

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className ?? ""}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
    >
      {/* 画像レイヤー（パン／ピンチを受ける） */}
      <div
        className="absolute inset-0 overflow-hidden touch-none"
        onPointerDown={handleImagePointerDown}
      >
        {imageUrl && (
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: imageRect.x,
              top: imageRect.y,
              width: imageRect.w,
              height: imageRect.h,
              maxWidth: "none",
            }}
          />
        )}
      </div>

      {/* 暗転マスク（切り抜き枠の外を暗く） */}
      {crop.w > 0 && crop.h > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="crop-mask">
              <rect x="0" y="0" width={containerSize.w} height={containerSize.h} fill="white" />
              <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={containerSize.w}
            height={containerSize.h}
            fill="rgba(0,0,0,0.45)"
            mask="url(#crop-mask)"
          />
        </svg>
      )}

      {/* 切り抜き枠 */}
      {crop.w > 0 && crop.h > 0 && (
        <div
          className="absolute"
          style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
        >
          {/* 枠本体（ドラッグで移動） */}
          <div
            className="absolute inset-0 border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0)] touch-none"
            onPointerDown={handleCropBodyPointerDown}
            style={{ cursor: "move" }}
          >
            {/* 3分割グリッド */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/50" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/50" />
              <div className="absolute top-1/3 left-0 h-px w-full bg-white/50" />
              <div className="absolute top-2/3 left-0 h-px w-full bg-white/50" />
            </div>
          </div>

          {/* 4隅ハンドル */}
          {(["nw", "ne", "sw", "se"] as const).map((h) => {
            const pos: Record<typeof h, string> = {
              nw: "-left-2.5 -top-2.5 cursor-nwse-resize",
              ne: "-right-2.5 -top-2.5 cursor-nesw-resize",
              sw: "-left-2.5 -bottom-2.5 cursor-nesw-resize",
              se: "-right-2.5 -bottom-2.5 cursor-nwse-resize",
            } as const;
            return (
              <div
                key={h}
                className={`${handleStyle} ${pos[h]}`}
                onPointerDown={handleHandlePointerDown(h)}
              />
            );
          })}

          {/* 4辺中央ハンドル */}
          <div
            className={`${edgeHandleStyle} h-5 w-10 -top-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize`}
            onPointerDown={handleHandlePointerDown("n")}
          />
          <div
            className={`${edgeHandleStyle} h-5 w-10 -bottom-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize`}
            onPointerDown={handleHandlePointerDown("s")}
          />
          <div
            className={`${edgeHandleStyle} w-5 h-10 -left-2.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
            onPointerDown={handleHandlePointerDown("w")}
          />
          <div
            className={`${edgeHandleStyle} w-5 h-10 -right-2.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
            onPointerDown={handleHandlePointerDown("e")}
          />
        </div>
      )}
    </div>
  );
}
