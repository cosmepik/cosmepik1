/**
 * コスメカードのデザインオプション
 * カードの形状・画像の形状を変えるテンプレート群
 */
export type CardDesignId =
  | "default"
  | "pill"
  | "square"
  | "neubrutalism"
  | "rectangle"
  | "pop";

export interface CardDesign {
  id: CardDesignId;
  nameJa: string;
  /** リストカード用（横並び） */
  listClassName: string;
  /** 商品カード用（画像+テキスト） */
  productClassName: string;
  /** リストカード内の画像コンテナ */
  listImageClassName: string;
  /** 商品カード内の画像コンテナ */
  productImageClassName: string;
}

export const cardDesigns: CardDesign[] = [
  {
    id: "default",
    nameJa: "スタンダード",
    listClassName: "min-h-[60px] rounded-xl bg-card p-2.5 shadow-sm transition-all hover:shadow-md",
    productClassName: "rounded-xl bg-card shadow-sm transition-all hover:shadow-md overflow-hidden",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary",
    productImageClassName: "relative aspect-square overflow-hidden bg-secondary",
  },
  {
    id: "pill",
    nameJa: "ピル",
    listClassName: "min-h-[60px] rounded-full bg-card p-1.5 pr-4 shadow-sm transition-all hover:shadow-md",
    productClassName: "rounded-[2rem] bg-card shadow-sm overflow-hidden transition-all hover:shadow-md",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-full bg-secondary",
    productImageClassName: "relative aspect-square overflow-hidden bg-secondary",
  },
  {
    id: "square",
    nameJa: "スクエア",
    listClassName: "min-h-[60px] rounded-none bg-card p-2.5 border-l-4 border-primary/60 transition-all hover:border-primary",
    productClassName: "rounded-none bg-card border-b-4 border-primary/60 overflow-hidden transition-all hover:border-primary",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-none bg-secondary",
    productImageClassName: "relative aspect-square overflow-hidden bg-secondary",
  },
  {
    id: "neubrutalism",
    nameJa: "ネオブルータル",
    listClassName: "min-h-[60px] rounded-lg bg-card p-2.5 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-[2px] hover:translate-y-[2px]",
    productClassName: "rounded-lg bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-[2px] hover:translate-y-[2px]",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 border-foreground bg-secondary",
    productImageClassName: "relative aspect-square overflow-hidden border-b-2 border-foreground bg-secondary",
  },
  {
    id: "rectangle",
    nameJa: "長方形",
    listClassName: "min-h-[60px] rounded-none bg-card p-2.5 shadow-sm transition-all hover:shadow-md",
    productClassName: "rounded-none bg-card shadow-sm transition-all hover:shadow-md overflow-hidden",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-none bg-secondary",
    productImageClassName: "relative aspect-square overflow-hidden bg-secondary",
  },
  {
    id: "pop",
    nameJa: "ポップ",
    listClassName: "min-h-[60px] rounded-2xl bg-primary/10 p-2.5 ring-2 ring-primary/30 transition-all hover:ring-primary/60 hover:bg-primary/15",
    productClassName: "rounded-2xl bg-primary/10 ring-2 ring-primary/30 overflow-hidden transition-all hover:ring-primary/60 hover:bg-primary/15",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/20 ring-2 ring-primary/20",
    productImageClassName: "relative aspect-square overflow-hidden bg-primary/10",
  },
];

export const DEFAULT_CARD_DESIGN_ID: CardDesignId = "default";

export function getCardDesign(cardDesignId: CardDesignId | string | undefined): CardDesign {
  const id = cardDesignId && cardDesigns.some((c) => c.id === cardDesignId) ? (cardDesignId as CardDesignId) : DEFAULT_CARD_DESIGN_ID;
  return cardDesigns.find((c) => c.id === id) ?? cardDesigns[0]!;
}
