import type { ThemeId } from "@/lib/theme";
import type { CardDesignId } from "@/lib/card-designs";
import type { FontId } from "@/lib/design-options";

export type BaseThemeId =
  | "minimal"
  | "elegant"
  | "cute"
  | "natural"
  | "wafu"
  | "modern"
  | "feminine"
  | "fresh";

export interface BaseTheme {
  id: BaseThemeId;
  name: string;
  description: string;
  themeId: ThemeId;
  cardDesignId: CardDesignId;
  fontId: FontId;
}

/** ベーステーマ：壁紙・カード枠・フォントの組み合わせプリセット */
export const BASE_THEMES: BaseTheme[] = [
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプルで洗練された印象",
    themeId: "white",
    cardDesignId: "square",
    fontId: "sans",
  },
  {
    id: "elegant",
    name: "エレガント",
    description: "上品で大人っぽい雰囲気",
    themeId: "gold-cream",
    cardDesignId: "default",
    fontId: "shippori",
  },
  {
    id: "cute",
    name: "キュート",
    description: "かわいらしいピンク系",
    themeId: "cute",
    cardDesignId: "pill",
    fontId: "mplus-rounded",
  },
  {
    id: "natural",
    name: "ナチュラル",
    description: "落ち着いた自然な雰囲気",
    themeId: "default",
    cardDesignId: "default",
    fontId: "noto-sans",
  },
  {
    id: "wafu",
    name: "和モダン",
    description: "和を感じるモダンなデザイン",
    themeId: "sand",
    cardDesignId: "neubrutalism",
    fontId: "shippori",
  },
  {
    id: "modern",
    name: "モダン",
    description: "クールでスタイリッシュ",
    themeId: "tech",
    cardDesignId: "rectangle",
    fontId: "zen",
  },
  {
    id: "feminine",
    name: "フェミニン",
    description: "華やかで女性らしい",
    themeId: "feminine",
    cardDesignId: "pop",
    fontId: "mincho",
  },
  {
    id: "fresh",
    name: "フレッシュ",
    description: "爽やかで清潔感のある印象",
    themeId: "mint",
    cardDesignId: "default",
    fontId: "noto-sans",
  },
];

export const DEFAULT_BASE_THEME_ID: BaseThemeId = "natural";
