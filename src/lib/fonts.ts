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

const FONT_FAMILY_MAP: Record<FontId, string> = {
  sans: "var(--font-noto-sans), 'Noto Sans JP', sans-serif",
  rounded: "'M PLUS Rounded 1c', var(--font-noto-sans), sans-serif",
  mincho: "'Shippori Mincho', serif",
  serif: "'Cormorant Garamond', serif",
  "noto-sans": "var(--font-noto-sans), 'Noto Sans JP', sans-serif",
  shippori: "'Shippori Mincho', serif",
  zen: "'Zen Kaku Gothic New', var(--font-noto-sans), sans-serif",
  "zen-maru": "'Zen Maru Gothic', var(--font-noto-sans), sans-serif",
  "mplus-rounded": "'M PLUS Rounded 1c', var(--font-noto-sans), sans-serif",
  kosugi: "'Kosugi Maru', var(--font-noto-sans), sans-serif",
  "noto-serif": "'Noto Serif JP', serif",
};

const VALID_FONT_IDS: FontId[] = [
  "sans", "rounded", "mincho", "serif", "noto-sans",
  "shippori", "zen", "zen-maru", "mplus-rounded", "kosugi", "noto-serif",
];

export function getFontFamily(fontId: FontId): string {
  return FONT_FAMILY_MAP[fontId] ?? FONT_FAMILY_MAP.sans;
}

export function isValidFontId(id: string): id is FontId {
  return VALID_FONT_IDS.includes(id as FontId);
}
