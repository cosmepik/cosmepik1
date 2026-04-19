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
    listClassName: "min-h-[60px] rounded-xl p-2.5 transition-all",
    productClassName: "rounded-xl transition-all overflow-hidden",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-lg",
    productImageClassName: "relative aspect-square overflow-hidden",
  },
  {
    id: "pill",
    nameJa: "ピル",
    listClassName: "min-h-[60px] rounded-full p-1.5 pr-4 transition-all",
    productClassName: "rounded-[2rem] overflow-hidden transition-all",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-full",
    productImageClassName: "relative aspect-square overflow-hidden",
  },
  {
    id: "square",
    nameJa: "スクエア",
    listClassName: "min-h-[60px] rounded-none p-2.5 border-l-4 border-primary/60 transition-all hover:border-primary",
    productClassName: "rounded-none border-b-4 border-primary/60 overflow-hidden transition-all hover:border-primary",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-none",
    productImageClassName: "relative aspect-square overflow-hidden",
  },
  {
    id: "neubrutalism",
    nameJa: "ネオブルータル",
    listClassName: "min-h-[60px] rounded-lg p-2.5 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-[2px] hover:translate-y-[2px]",
    productClassName: "rounded-lg border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-[2px] hover:translate-y-[2px]",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 border-foreground",
    productImageClassName: "relative aspect-square overflow-hidden border-b-2 border-foreground",
  },
  {
    id: "rectangle",
    nameJa: "長方形",
    listClassName: "min-h-[60px] rounded-none p-2.5 transition-all",
    productClassName: "rounded-none transition-all overflow-hidden",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-none",
    productImageClassName: "relative aspect-square overflow-hidden",
  },
  {
    id: "pop",
    nameJa: "ポップ",
    listClassName: "min-h-[60px] rounded-2xl p-2.5 ring-2 ring-primary/30 transition-all hover:ring-primary/60",
    productClassName: "rounded-2xl ring-2 ring-primary/30 overflow-hidden transition-all hover:ring-primary/60",
    listImageClassName: "h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20",
    productImageClassName: "relative aspect-square overflow-hidden",
  },
];

export const DEFAULT_CARD_DESIGN_ID: CardDesignId = "default";

export function getCardDesign(cardDesignId: CardDesignId | string | undefined): CardDesign {
  const id = cardDesignId && cardDesigns.some((c) => c.id === cardDesignId) ? (cardDesignId as CardDesignId) : DEFAULT_CARD_DESIGN_ID;
  return cardDesigns.find((c) => c.id === id) ?? cardDesigns[0]!;
}
