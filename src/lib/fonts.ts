export type FontId =
  | "sans"
  | "rounded"
  | "mincho"
  | "serif"
  | "noto-sans"
  | "shippori"
  | "zen"
  | "zen-maru"
  | "mplus-rounded"
  | "kosugi"
  | "noto-serif";

export const fonts: { id: FontId; name: string; nameJa: string }[] = [
  { id: "sans", name: "Noto Sans JP", nameJa: "ゴシック" },
  { id: "serif", name: "Cormorant Garamond", nameJa: "明朝" },
  { id: "rounded", name: "M PLUS Rounded 1c", nameJa: "丸ゴシック" },
  { id: "noto-sans", name: "Noto Sans JP", nameJa: "Noto Sans JP" },
  { id: "shippori", name: "Shippori Mincho", nameJa: "しっぽり明朝" },
  { id: "zen", name: "Zen Kaku Gothic New", nameJa: "Zen角ゴ" },
  { id: "zen-maru", name: "Zen Maru Gothic", nameJa: "Zen丸ゴ" },
  { id: "mplus-rounded", name: "M PLUS Rounded 1c", nameJa: "M PLUS Rounded" },
  { id: "kosugi", name: "Kosugi Maru", nameJa: "小杉丸ゴ" },
  { id: "noto-serif", name: "Noto Serif JP", nameJa: "Noto Serif JP" },
  { id: "mincho", name: "Shippori Mincho", nameJa: "明朝体" },
];

const FONT_VAR_MAP: Record<FontId, string> = {
  sans: "var(--font-noto-sans)",
  rounded: "var(--font-rounded)",
  mincho: "var(--font-mincho)",
  serif: "var(--font-serif)",
  "noto-sans": "var(--font-noto-sans)",
  shippori: "var(--font-mincho)",
  zen: "var(--font-zen)",
  "zen-maru": "var(--font-zen-maru)",
  "mplus-rounded": "var(--font-rounded)",
  kosugi: "var(--font-kosugi)",
  "noto-serif": "var(--font-noto-serif)",
};

const VALID_FONT_IDS: FontId[] = [
  "sans",
  "rounded",
  "mincho",
  "serif",
  "noto-sans",
  "shippori",
  "zen",
  "zen-maru",
  "mplus-rounded",
  "kosugi",
  "noto-serif",
];

export function getFontFamily(fontId: FontId): string {
  return FONT_VAR_MAP[fontId] ?? FONT_VAR_MAP.sans;
}

export function isValidFontId(id: string): id is FontId {
  return VALID_FONT_IDS.includes(id as FontId);
}
