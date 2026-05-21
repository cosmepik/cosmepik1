"use client";

/**
 * 自由な矩形（アスペクト比フリー）で切り抜き範囲を指定でき、
 * スマホのピンチで画像をズーム／パンできるカスタム・クロッパー。
 *
 * ## iOS Safari 対応
 *
 * 以前の実装では、4 隅／4 辺のハンドルを cropDiv の外側（負のオフセット）に
 * 配置し、それぞれに onPointerDown を持たせていた。iOS Safari にはブラウザの
 * bounds 外の子要素にタッチイベントが届かない既知バグがあり、ハンドルを
 * 触ったつもりが下の「画像パン」レイヤーに当たって画像が動いてしまっていた。
 *
 * 修正後の設計:
 *   - pointerdown を全てコンテナ一箇所で受け取り、ポインタ座標を
 *     「ハンドル円内 > クロップ枠内 > 画像パン」の順で判定する。
 *   - ハンドル判定半径は 26px（Apple HIG 44px の半分程度）にし、
 *     スマホの太い指でも確実に当たるようにする。
 *   - touchstart/touchmove に non-passive preventDefault を登録し、
 *     overflow-y-auto 親による iOS スクロール横取りと pointercancel を防ぐ。
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as RPointerEvent } from "react";

export type PixelArea = { x: number; y: number; width: number; height: number };

type CropRect = { x: number; y: number; w: number; h: number };
type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

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

const MIN_CROP = 24;
const MIN_SCALE = 1;
const MAX_SCALE = 6;
/** ハンドル判定半径（px）。スマホの指に合わせて大きめ。 */
const HANDLE_HIT_R = 26;

interface Props {
  imageUrl: string;
  onChange: (area: PixelArea | null) => void;
  className?: string;
}

export function ManualCropper({ imageUrl, onChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const interactionRef = useRef<Interaction | null>(null);

  // 最新の crop を ref でも保持（pointerdown ハンドラ内でのクロージャ陳腐化を防ぐ）
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const translateRef = useRef(translate);
  translateRef.current = translate;

  // ── コンテナサイズ追跡 ──────────────────────────────
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

  // ── iOS スクロール横取り対策 ──────────────────────────
  // overflow-y-auto 親が touch イベントを横取りすると pointercancel が発火し
  // 操作が強制終了される。touchstart/touchmove で preventDefault() することで
  // 親スクロールを完全に止める。passive: false が必須。
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchstart", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      el.removeEventListener("touchstart", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, []);

  // ── 画像ロード ───────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  // ── contain-fit 寸法 ─────────────────────────────────
  const fit = useMemo(() => {
    if (!containerSize.w || !containerSize.h || !natural.w || !natural.h) {
      return { rw: 0, rh: 0, ox: 0, oy: 0 };
    }
    const s = Math.min(containerSize.w / natural.w, containerSize.h / natural.h);
    const rw = natural.w * s;
    const rh = natural.h * s;
    return { rw, rh, ox: (containerSize.w - rw) / 2, oy: (containerSize.h - rh) / 2 };
  }, [containerSize, natural]);

  // ── 表示中の画像矩形（コンテナ座標系） ────────────────
  const imageRect = useMemo(() => {
    const w = fit.rw * scale;
    const h = fit.rh * scale;
    const cx = containerSize.w / 2 + translate.x;
    const cy = containerSize.h / 2 + translate.y;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }, [fit.rw, fit.rh, scale, translate.x, translate.y, containerSize.w, containerSize.h]);

  // ── 初期クロップ ─────────────────────────────────────
  useEffect(() => {
    if (!fit.rw || !fit.rh) return;
    if (crop.w > 0 && crop.h > 0) return;
    const w = fit.rw * 0.8;
    const h = fit.rh * 0.8;
    setCrop({
      x: (containerSize.w - w) / 2,
      y: (containerSize.h - h) / 2,
      w,
      h,
    });
  }, [fit.rw, fit.rh, containerSize.w, containerSize.h, crop.w, crop.h]);

  // ── 親への通知 ───────────────────────────────────────
  useEffect(() => {
    if (!natural.w || !natural.h || !imageRect.w || !imageRect.h || !crop.w || !crop.h) return;
    const left = Math.max(crop.x, imageRect.x);
    const top = Math.max(crop.y, imageRect.y);
    const right = Math.min(crop.x + crop.w, imageRect.x + imageRect.w);
    const bottom = Math.min(crop.y + crop.h, imageRect.y + imageRect.h);
    const iw = right - left;
    const ih = bottom - top;
    if (iw <= 1 || ih <= 1) { onChange(null); return; }
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

  // ── ユーティリティ ───────────────────────────────────
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

  /**
   * タッチ座標がどのハンドルに当たるか判定する。
   * iOS では DOM 要素への hit-test が親 bounds 外で失敗するため、
   * 座標ベースで判定することで回避する。
   */
  const getHandleAt = useCallback(
    (p: { x: number; y: number }): Handle | null => {
      const c = cropRef.current;
      if (!c.w || !c.h) return null;
      const centers: Array<{ h: Handle; cx: number; cy: number }> = [
        { h: "nw", cx: c.x, cy: c.y },
        { h: "n",  cx: c.x + c.w / 2, cy: c.y },
        { h: "ne", cx: c.x + c.w, cy: c.y },
        { h: "e",  cx: c.x + c.w, cy: c.y + c.h / 2 },
        { h: "se", cx: c.x + c.w, cy: c.y + c.h },
        { h: "s",  cx: c.x + c.w / 2, cy: c.y + c.h },
        { h: "sw", cx: c.x, cy: c.y + c.h },
        { h: "w",  cx: c.x, cy: c.y + c.h / 2 },
      ];
      for (const { h, cx, cy } of centers) {
        if (Math.hypot(p.x - cx, p.y - cy) <= HANDLE_HIT_R) return h;
      }
      return null;
    },
    [],
  );

  const isInsideCrop = useCallback((p: { x: number; y: number }): boolean => {
    const c = cropRef.current;
    if (!c.w || !c.h) return false;
    return p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h;
  }, []);

  // ── ポインタイベント（全てコンテナで受け取る） ──────────
  // iOS では cropDiv の外側に配置した handle 要素に pointerdown が届かないため、
  // コンテナ一箇所で受け取りポインタ座標で操作種別を判定する。
  const handlePointerDown = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
      const p = getLocal(e);
      pointersRef.current.set(e.pointerId, p);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      if (pointersRef.current.size === 2) {
        const [a, b] = Array.from(pointersRef.current.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const ids = Array.from(pointersRef.current.keys()) as [number, number];
        interactionRef.current = {
          kind: "pinch",
          ids,
          startDist: dist,
          startScale: scaleRef.current,
          startTx: translateRef.current.x,
          startTy: translateRef.current.y,
          startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        };
        return;
      }

      const handle = getHandleAt(p);
      if (handle) {
        interactionRef.current = {
          kind: "crop-resize",
          pointerId: e.pointerId,
          handle,
          startX: p.x,
          startY: p.y,
          startCrop: { ...cropRef.current },
        };
        return;
      }

      if (isInsideCrop(p)) {
        interactionRef.current = {
          kind: "crop-move",
          pointerId: e.pointerId,
          startX: p.x,
          startY: p.y,
          startCrop: { ...cropRef.current },
        };
        return;
      }

      interactionRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        startX: p.x,
        startY: p.y,
        startTx: translateRef.current.x,
        startTy: translateRef.current.y,
      };
    },
    [getHandleAt, isInsideCrop],
  );

  const handlePointerMove = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
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
        const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, it.startScale * (dist / it.startDist)));
        setScale(nextScale);
        setTranslate({
          x: it.startTx + (mid.x - it.startMid.x),
          y: it.startTy + (mid.y - it.startMid.y),
        });
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
        setCrop(clampCrop({
          x: it.startCrop.x + (p.x - it.startX),
          y: it.startCrop.y + (p.y - it.startY),
          w: it.startCrop.w,
          h: it.startCrop.h,
        }));
        return;
      }

      if (it.kind === "crop-resize" && it.pointerId === e.pointerId) {
        const dx = p.x - it.startX;
        const dy = p.y - it.startY;
        const s = it.startCrop;
        let x = s.x, y = s.y, w = s.w, h = s.h;
        if (it.handle.includes("w")) { x = s.x + dx; w = s.w - dx; }
        else if (it.handle.includes("e")) { w = s.w + dx; }
        if (it.handle.includes("n")) { y = s.y + dy; h = s.h - dy; }
        else if (it.handle.includes("s")) { h = s.h + dy; }
        if (w < MIN_CROP) { if (it.handle.includes("w")) x = s.x + s.w - MIN_CROP; w = MIN_CROP; }
        if (h < MIN_CROP) { if (it.handle.includes("n")) y = s.y + s.h - MIN_CROP; h = MIN_CROP; }
        setCrop(clampCrop({ x, y, w, h }));
      }
    },
    [clampCrop],
  );

  const handlePointerUpOrCancel = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2 && interactionRef.current?.kind === "pinch") {
      interactionRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      interactionRef.current = null;
    }
  }, []);

  // ── レンダリング ─────────────────────────────────────
  const handleStyle =
    "absolute h-6 w-6 rounded-full bg-white border-2 border-primary shadow-md touch-none pointer-events-none";
  const edgeHandleStyle =
    "absolute rounded-full bg-white border-2 border-primary/90 shadow touch-none pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className ?? ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
    >
      {/* 画像レイヤー（pointer-events-none — イベントはコンテナで受け取る） */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {imageUrl && (
          <img
            ref={imageRef}
            src={imageUrl}
            alt=""
            draggable={false}
            className="absolute select-none pointer-events-none"
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

      {/* 暗転マスク */}
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
            x="0" y="0"
            width={containerSize.w} height={containerSize.h}
            fill="rgba(0,0,0,0.45)"
            mask="url(#crop-mask)"
          />
        </svg>
      )}

      {/* 切り抜き枠（視覚のみ — pointer-events-none。操作は全てコンテナ） */}
      {crop.w > 0 && crop.h > 0 && (
        <div
          className="pointer-events-none absolute"
          style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
        >
          {/* 枠線 + 3 分割グリッド */}
          <div className="absolute inset-0 border-2 border-primary">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/50" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/50" />
              <div className="absolute top-1/3 left-0 h-px w-full bg-white/50" />
              <div className="absolute top-2/3 left-0 h-px w-full bg-white/50" />
            </div>
          </div>

          {/* 4 隅ハンドル */}
          {(["nw", "ne", "sw", "se"] as const).map((h) => {
            const pos: Record<string, string> = {
              nw: "-left-3 -top-3",
              ne: "-right-3 -top-3",
              sw: "-left-3 -bottom-3",
              se: "-right-3 -bottom-3",
            };
            return (
              <div key={h} className={`${handleStyle} ${pos[h]}`} />
            );
          })}

          {/* 4 辺中央ハンドル */}
          <div className={`${edgeHandleStyle} h-5 w-10 -top-2.5 left-1/2 -translate-x-1/2`} />
          <div className={`${edgeHandleStyle} h-5 w-10 -bottom-2.5 left-1/2 -translate-x-1/2`} />
          <div className={`${edgeHandleStyle} w-5 h-10 -left-2.5 top-1/2 -translate-y-1/2`} />
          <div className={`${edgeHandleStyle} w-5 h-10 -right-2.5 top-1/2 -translate-y-1/2`} />
        </div>
      )}
    </div>
  );
}
