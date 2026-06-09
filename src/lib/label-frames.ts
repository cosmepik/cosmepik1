/**
 * コスメタイトル（ラベル）の長方形フレームデザインの定義。
 *
 * 編集キャンバス（recipe-canvas）・公開ビュー（PublicPageSSR）・画像保存
 * （html-to-image）のすべてで同じ定義を使うことで、見た目を完全に一致させる。
 *
 * フレームは「枠（container）」「ブランド名テキスト」「商品名テキスト」の
 * クラスで構成する。横幅 w-[120px] と中央寄せはレイアウト整合のため全フレーム
 * 共通とし、背景・枠線・角丸・文字色だけを切り替える。
 */
import type { CSSProperties } from "react";

export interface LabelFrame {
  id: string;
  /** ピッカーに表示する日本語名 */
  name: string;
  /** 枠（box）の Tailwind クラス。w-[120px] と text-center を含める */
  container: string;
  /**
   * backdrop-filter（インライン）。指定時のみ付与する。
   * 画像保存時はキャプチャ処理側で一時的に無効化されるため表示と保存で差は出ない。
   */
  backdrop?: string;
  /**
   * 装飾フレームの SVG マークアップ。指定時は背景として 100%×100% に伸ばして
   * 描画する（雲・二重枠・角切り・飾り枠など、CSS の border では表現できない形状用）。
   * SVG は透過背景・白塗り・濃色アウトラインで作り、保存(html-to-image)・公開ビュー・
   * 編集画面のすべてで同じ data URI 背景として描画されるため見た目が一致する。
   */
  svg?: string;
  /** ブランド名 <p> のクラス（サイズ・太さ・色） */
  brand: string;
  /** 商品名 <p> のクラス（サイズ・太さ・色・行数） */
  product: string;
}

const FRAME_LINE = "#2c2c3a";

/** 二重線の角丸枠 */
const DOUBLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect x="5" y="5" width="190" height="90" rx="14" fill="#ffffff" stroke="${FRAME_LINE}" stroke-width="3"/><rect x="11" y="11" width="178" height="78" rx="10" fill="none" stroke="${FRAME_LINE}" stroke-width="1.5"/></svg>`;

/** 角を落とした八角形枠 */
const CUT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><polygon points="22,5 178,5 195,24 195,76 178,95 22,95 5,76 5,24" fill="#ffffff" stroke="${FRAME_LINE}" stroke-width="3" stroke-linejoin="round"/></svg>`;

/** 四隅に飾りドットを付けた二重罫の飾り枠 */
const ORNATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect x="8" y="8" width="184" height="84" rx="6" fill="#ffffff" stroke="${FRAME_LINE}" stroke-width="2.5"/><rect x="14" y="14" width="172" height="72" rx="4" fill="none" stroke="${FRAME_LINE}" stroke-width="1"/><g fill="${FRAME_LINE}"><circle cx="14" cy="14" r="3.2"/><circle cx="186" cy="14" r="3.2"/><circle cx="14" cy="86" r="3.2"/><circle cx="186" cy="86" r="3.2"/></g></svg>`;

/** 白背景＋四隅のカギ括弧（隅マーク）枠 */
const BRACKETS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect x="3" y="3" width="194" height="94" rx="4" fill="#ffffff"/><g fill="none" stroke="${FRAME_LINE}" stroke-width="3" stroke-linecap="round"><path d="M12,30 V12 H30"/><path d="M170,12 H188 V30"/><path d="M188,70 V88 H170"/><path d="M30,88 H12 V70"/></g></svg>`;

/** 手描き風のラフな二重線枠（少しずらした2本のラインで落書きっぽく） */
const SKETCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><rect x="6" y="7" width="188" height="86" rx="10" fill="#ffffff" stroke="${FRAME_LINE}" stroke-width="2.5" stroke-linejoin="round"/><path d="M12,16 Q60,11 110,13 T190,16 M194,30 Q189,55 191,84 M188,90 Q120,95 70,92 T11,89 M9,82 Q5,50 8,20" fill="none" stroke="${FRAME_LINE}" stroke-width="1" stroke-linecap="round" opacity="0.7"/></svg>`;

/** チケット風（左右中央にミシン目ノッチ） */
const TICKET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M6,6 H194 V44 A6,6 0 0 0 194,56 V94 H6 V56 A6,6 0 0 0 6,44 Z" fill="#ffffff" stroke="${FRAME_LINE}" stroke-width="2.5" stroke-linejoin="round"/><line x1="30" y1="20" x2="30" y2="80" stroke="${FRAME_LINE}" stroke-width="1.5" stroke-dasharray="4 5"/></svg>`;

/** ラベルの日本語ゴシック体スタック（画面・保存で字形を一致させる） */
export const LABEL_FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif";

export const LABEL_FRAMES: LabelFrame[] = [
  {
    id: "dark",
    name: "ダーク",
    container: "w-[120px] bg-black/40 px-1.5 py-0.5 text-center",
    backdrop: "blur(2px)",
    brand: "truncate text-[11px] font-bold text-white",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-white",
  },
  {
    id: "light",
    name: "ライト",
    container: "w-[120px] bg-white/85 px-1.5 py-0.5 text-center",
    backdrop: "blur(2px)",
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "outline",
    name: "アウトライン",
    container: "w-[120px] bg-black/25 px-1.5 py-0.5 text-center border border-white/90",
    backdrop: "blur(2px)",
    brand: "truncate text-[11px] font-bold text-white",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-white",
  },
  {
    id: "pill",
    name: "ピル",
    container: "w-[120px] bg-black/55 px-2 py-1 text-center rounded-full",
    backdrop: "blur(2px)",
    brand: "truncate text-[11px] font-bold text-white",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-white/95",
  },
  {
    id: "card",
    name: "カード",
    container: "w-[120px] bg-white px-1.5 py-1 text-center rounded-lg shadow-md",
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-600",
  },
  {
    id: "pink",
    name: "ピンク",
    container: "w-[120px] bg-[#e8729a] px-1.5 py-0.5 text-center rounded-md",
    brand: "truncate text-[11px] font-bold text-white",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-white",
  },
  {
    id: "double",
    name: "二重枠",
    container: "w-[120px] px-3 py-2 text-center",
    svg: DOUBLE_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "cut",
    name: "角切り",
    container: "w-[120px] px-4 py-2 text-center",
    svg: CUT_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "ornate",
    name: "飾り枠",
    container: "w-[120px] px-3.5 py-2.5 text-center",
    svg: ORNATE_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "brackets",
    name: "隅マーク",
    container: "w-[120px] px-3.5 py-2.5 text-center",
    svg: BRACKETS_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "sketch",
    name: "手描き",
    container: "w-[120px] px-3.5 py-2.5 text-center",
    svg: SKETCH_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "ticket",
    name: "チケット",
    container: "w-[120px] px-4 py-2 text-center",
    svg: TICKET_SVG,
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "dashed",
    name: "破線",
    container:
      "w-[120px] bg-white px-2 py-1 text-center rounded-md border-2 border-dashed border-neutral-700",
    brand: "truncate text-[11px] font-bold text-neutral-900",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-neutral-700",
  },
  {
    id: "gradient",
    name: "グラデ",
    container:
      "w-[120px] bg-gradient-to-br from-[#e8729a] to-[#a455c7] px-1.5 py-0.5 text-center rounded-md",
    brand: "truncate text-[11px] font-bold text-white",
    product: "line-clamp-4 text-[10px] font-medium leading-tight text-white",
  },
];

export const DEFAULT_LABEL_FRAME_ID = "dark";

/** id からフレームを引く。未指定・不明な場合はデフォルト（ダーク）を返す */
export function getLabelFrame(id?: string | null): LabelFrame {
  return LABEL_FRAMES.find((f) => f.id === id) ?? LABEL_FRAMES[0];
}

/** SVG マークアップを CSS の url() で使える data URI に変換する */
function svgToUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * フレームを描画するための inline style を返す。
 * 編集キャンバス・公開ビュー・ピッカーすべてで同じ style を使うことで見た目を一致させる。
 */
export function getFrameStyle(frame: LabelFrame): CSSProperties {
  const style: CSSProperties = { fontFamily: LABEL_FONT_FAMILY };
  if (frame.backdrop) {
    style.backdropFilter = frame.backdrop;
    style.WebkitBackdropFilter = frame.backdrop;
  }
  if (frame.svg) {
    style.backgroundImage = svgToUrl(frame.svg);
    style.backgroundSize = "100% 100%";
    style.backgroundRepeat = "no-repeat";
  }
  return style;
}
