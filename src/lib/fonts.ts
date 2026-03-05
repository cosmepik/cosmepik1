export type FontId = "sans" | "rounded" | "mincho" | "serif";

export const fonts: { id: FontId; name: string; nameJa: string }[] = [
  { id: "sans", name: "Noto Sans JP", nameJa: "ノトサン" },
  { id: "rounded", name: "M PLUS Rounded 1c", nameJa: "まるゴシック" },
  { id: "mincho", name: "Shippori Mincho", nameJa: "明朝体" },
  { id: "serif", name: "Cormorant Garamond", nameJa: "セリフ" },
];

const FONT_VAR_MAP: Record<FontId, string> = {
  sans: "var(--font-noto-sans)",
  rounded: "var(--font-rounded)",
  mincho: "var(--font-mincho)",
  serif: "var(--font-serif)",
};

export function getFontFamily(fontId: FontId): string {
  return FONT_VAR_MAP[fontId] ?? FONT_VAR_MAP.sans;
}
