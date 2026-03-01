/** コスメカード枠デザイン */
export type CardDesignId =
  | "default"
  | "minimal"
  | "rounded"
  | "shadow"
  | "border-gold"
  | "pill"
  | "square"
  | "dotted"
  | "dashed"
  | "glass"
  | "soft"
  | "double"
  | "pink"
  | "rose"
  | "elegant"
  | "vintage"
  | "mint"
  | "lavender";

export interface CardDesign {
  id: CardDesignId;
  name: string;
  cardClassName: string;
}

export const CARD_DESIGNS: CardDesign[] = [
  { id: "default", name: "標準", cardClassName: "card-design-default" },
  { id: "minimal", name: "ミニマル", cardClassName: "card-design-minimal" },
  { id: "rounded", name: "角丸", cardClassName: "card-design-rounded" },
  { id: "shadow", name: "シャドウ", cardClassName: "card-design-shadow" },
  { id: "border-gold", name: "ゴールド枠", cardClassName: "card-design-border-gold" },
  { id: "pill", name: "ピル形", cardClassName: "card-design-pill" },
  { id: "square", name: "四角", cardClassName: "card-design-square" },
  { id: "dotted", name: "点線枠", cardClassName: "card-design-dotted" },
  { id: "dashed", name: "破線枠", cardClassName: "card-design-dashed" },
  { id: "glass", name: "ガラス", cardClassName: "card-design-glass" },
  { id: "soft", name: "ソフト", cardClassName: "card-design-soft" },
  { id: "double", name: "ダブル枠", cardClassName: "card-design-double" },
  { id: "pink", name: "ピンク枠", cardClassName: "card-design-pink" },
  { id: "rose", name: "ローズ枠", cardClassName: "card-design-rose" },
  { id: "elegant", name: "エレガント", cardClassName: "card-design-elegant" },
  { id: "vintage", name: "ヴィンテージ", cardClassName: "card-design-vintage" },
  { id: "mint", name: "ミント", cardClassName: "card-design-mint" },
  { id: "lavender", name: "ラベンダー", cardClassName: "card-design-lavender" },
];

export const DEFAULT_CARD_DESIGN_ID: CardDesignId = "default";

/** ページフォント */
export type FontId =
  | "sans"
  | "serif"
  | "rounded"
  | "noto-sans"
  | "shippori"
  | "zen"
  | "mplus-rounded"
  | "kosugi"
  | "noto-serif";

export interface FontOption {
  id: FontId;
  name: string;
  fontClassName: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "sans", name: "ゴシック", fontClassName: "font-sans" },
  { id: "serif", name: "明朝", fontClassName: "font-serif" },
  { id: "rounded", name: "丸ゴシック", fontClassName: "font-rounded" },
  { id: "noto-sans", name: "Noto Sans JP", fontClassName: "font-noto-sans" },
  { id: "shippori", name: "しっぽり明朝", fontClassName: "font-shippori" },
  { id: "zen", name: "Zen角ゴ", fontClassName: "font-zen" },
  { id: "mplus-rounded", name: "M PLUS Rounded", fontClassName: "font-mplus-rounded" },
  { id: "kosugi", name: "小杉丸ゴ", fontClassName: "font-kosugi" },
  { id: "noto-serif", name: "Noto Serif JP", fontClassName: "font-noto-serif" },
];

export const DEFAULT_FONT_ID: FontId = "sans";
