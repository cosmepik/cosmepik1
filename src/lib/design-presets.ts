/**
 * デザインプリセット（テーマ + 背景 + フォントの組み合わせ）
 * ユーザーがベースのデザインを一括で選べる
 */
import type { ThemeId } from "@/lib/themes";
import type { FontId } from "@/lib/fonts";

import type { CardDesignId } from "@/lib/card-designs";

export interface DesignPreset {
  id: string;
  nameJa: string;
  description: string;
  themeId: ThemeId;
  backgroundId: string;
  fontId: FontId;
  cardDesignId?: CardDesignId;
  /** プレビュー用の色（テーマの primary） */
  previewColor: string;
}

export const designPresets: DesignPreset[] = [
  {
    id: "natural",
    nameJa: "ナチュラル",
    description: "シンプルで清潔感",
    themeId: "default",
    backgroundId: "solid-white",
    fontId: "mincho",
    cardDesignId: "default",
    previewColor: "#4a9e6e",
  },
  {
    id: "mint-fresh",
    nameJa: "ミントフレッシュ",
    description: "爽やかなミント",
    themeId: "mint-sparkle",
    backgroundId: "gradient-mermaid",
    fontId: "mincho",
    previewColor: "#56c8c8",
  },
  {
    id: "peach-blossom",
    nameJa: "ピーチブロッサム",
    description: "ふんわりピンク",
    themeId: "peach-blossom",
    backgroundId: "gradient-sakura",
    fontId: "mincho",
    previewColor: "#e8829a",
  },
  {
    id: "lavender-dream",
    nameJa: "ラベンダードリーム",
    description: "やさしいパープル",
    themeId: "lavender-haze",
    backgroundId: "gradient-lavender",
    fontId: "mincho",
    previewColor: "#9b8ec4",
  },
  {
    id: "rose-elegant",
    nameJa: "ローズエレガント",
    description: "上品なローズ",
    themeId: "rose-quartz",
    backgroundId: "gradient-rose",
    fontId: "mincho",
    previewColor: "#c4727e",
  },
  {
    id: "ocean-breeze",
    nameJa: "オーシャンブリーズ",
    description: "クールなブルー",
    themeId: "aqua-serum",
    backgroundId: "gradient-ocean",
    fontId: "mincho",
    previewColor: "#8bb5a2",
  },
  {
    id: "sunset-warm",
    nameJa: "サンセットウォーム",
    description: "あたたかいオレンジ",
    themeId: "vitamin-glow",
    backgroundId: "gradient-sunset",
    fontId: "mincho",
    previewColor: "#e8943a",
  },
  {
    id: "honey-sweet",
    nameJa: "ハニースイート",
    description: "あたたかいイエロー",
    themeId: "honey-butter",
    backgroundId: "gradient-honey",
    fontId: "mincho",
    previewColor: "#c9a84c",
  },
  {
    id: "midnight-chic",
    nameJa: "ミッドナイトシック",
    description: "シックなネイビー",
    themeId: "midnight-navy",
    backgroundId: "solid-cream",
    fontId: "mincho",
    previewColor: "#4a5e8a",
  },
  {
    id: "cherry-bold",
    nameJa: "チェリーボールド",
    description: "大胆なレッド",
    themeId: "cherry-red",
    backgroundId: "solid-blush",
    fontId: "mincho",
    previewColor: "#c94c4c",
  },
  {
    id: "aurora-magic",
    nameJa: "オーロラマジック",
    description: "幻想的なグラデ",
    themeId: "mint-sparkle",
    backgroundId: "gradient-aurora",
    fontId: "mincho",
    previewColor: "#56c8c8",
  },
  {
    id: "unicorn-fun",
    nameJa: "ユニコーンファン",
    description: "ポップで楽しい",
    themeId: "lavender-haze",
    backgroundId: "gradient-unicorn",
    fontId: "mincho",
    previewColor: "#9b8ec4",
  },
];
