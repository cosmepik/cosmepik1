/**
 * コスメカードのデザインオプション
 * リストカード・商品カードに適用
 */
export type CardDesignId =
  | "default"
  | "minimal"
  | "rounded"
  | "shadow"
  | "bordered"
  | "soft"
  | "glass"
  | "dashed";

export interface CardDesign {
  id: CardDesignId;
  nameJa: string;
  /** リストカード用（横並び） */
  listClassName: string;
  /** 商品カード用（画像+テキスト） */
  productClassName: string;
}

export const cardDesigns: CardDesign[] = [
  {
    id: "default",
    nameJa: "標準",
    listClassName: "rounded-xl bg-card p-2.5 shadow-sm transition-all hover:shadow-md",
    productClassName: "rounded-xl bg-card shadow-sm transition-all hover:shadow-md",
  },
  {
    id: "minimal",
    nameJa: "ミニマル",
    listClassName: "rounded-lg bg-card/95 p-2.5 border border-border transition-all hover:border-primary/30",
    productClassName: "rounded-lg bg-card/95 border border-border shadow-sm transition-all hover:border-primary/30",
  },
  {
    id: "rounded",
    nameJa: "角丸",
    listClassName: "rounded-2xl bg-card p-2.5 shadow-sm transition-all hover:shadow-md",
    productClassName: "rounded-2xl bg-card shadow-sm transition-all hover:shadow-md",
  },
  {
    id: "shadow",
    nameJa: "シャドウ",
    listClassName: "rounded-xl bg-card p-2.5 shadow-lg shadow-black/5 transition-all hover:shadow-xl",
    productClassName: "rounded-xl bg-card shadow-lg shadow-black/5 transition-all hover:shadow-xl",
  },
  {
    id: "bordered",
    nameJa: "枠線",
    listClassName: "rounded-xl bg-card p-2.5 border-2 border-primary/40 shadow-sm transition-all hover:border-primary/60",
    productClassName: "rounded-xl bg-card border-2 border-primary/40 shadow-sm transition-all hover:border-primary/60",
  },
  {
    id: "soft",
    nameJa: "ソフト",
    listClassName: "rounded-2xl bg-card/90 p-2.5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md",
    productClassName: "rounded-2xl bg-card/90 shadow-sm backdrop-blur-sm transition-all hover:shadow-md",
  },
  {
    id: "glass",
    nameJa: "ガラス",
    listClassName: "rounded-xl bg-card/80 p-2.5 border border-white/60 shadow-sm backdrop-blur-sm transition-all hover:bg-card/90",
    productClassName: "rounded-xl bg-card/80 border border-white/60 shadow-sm backdrop-blur-sm transition-all hover:bg-card/90",
  },
  {
    id: "dashed",
    nameJa: "破線枠",
    listClassName: "rounded-xl bg-card p-2.5 border-2 border-dashed border-border transition-all hover:border-primary/50",
    productClassName: "rounded-xl bg-card border-2 border-dashed border-border shadow-sm transition-all hover:border-primary/50",
  },
];

export const DEFAULT_CARD_DESIGN_ID: CardDesignId = "default";

export function getCardDesign(cardDesignId: CardDesignId | string | undefined): CardDesign {
  const id = cardDesignId && cardDesigns.some((c) => c.id === cardDesignId) ? (cardDesignId as CardDesignId) : DEFAULT_CARD_DESIGN_ID;
  return cardDesigns.find((c) => c.id === id) ?? cardDesigns[0]!;
}
