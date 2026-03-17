/**
 * デザインプリセット（テーマ + 背景 + フォントの組み合わせ）
 * ユーザーがベースのデザインを一括で選べる
 */

import type { ThemeId } from "@/lib/themes";
import type { FontId } from "@/lib/fonts";

export interface DesignPreset {
  id: string;
  nameJa: string;
  description: string;
  themeId: ThemeId;
  backgroundId: string;
  fontId: FontId;
  /** プレビュー用のメインカラー（テーマのprimary） */
  previewColor: string;
}

export const designPresets: DesignPreset[] = [
  {
    id: "green-natural",
    nameJa: "グリーンティー",
    description: "ナチュラルな緑",
    themeId: "default",
    backgroundId: "gradient-mint",
    fontId: "sans",
    previewColor: "#4a9e6e",
  },
  {
    id: "peach-sakura",
    nameJa: "ピーチブロッサム",
    description: "ふんわり桜ピンク",
    themeId: "peach-blossom",
    backgroundId: "gradient-sakura",
    fontId: "sans",
    previewColor: "#e8829a",
  },
  {
    id: "mint-mermaid",
    nameJa: "ミントスパークル",
    description: "クールなマーメイド",
    themeId: "mint-sparkle",
    backgroundId: "gradient-mermaid",
    fontId: "sans",
    previewColor: "#56c8c8",
  },
  {
    id: "aqua-forest",
    nameJa: "アクアセラム",
    description: "しっとりフォレスト",
    themeId: "aqua-serum",
    backgroundId: "gradient-forest",
    fontId: "sans",
    previewColor: "#8bb5a2",
  },
  {
    id: "vitamin-honey",
    nameJa: "ビタミングロウ",
    description: "元気なハニー",
    themeId: "vitamin-glow",
    backgroundId: "gradient-honey",
    fontId: "rounded",
    previewColor: "#e8943a",
  },
  {
    id: "lavender-field",
    nameJa: "ラベンダーヘイズ",
    description: "やさしいラベンダー",
    themeId: "lavender-haze",
    backgroundId: "gradient-lavender",
    fontId: "serif",
    previewColor: "#9b8ec4",
  },
  {
    id: "rose-garden",
    nameJa: "ローズクォーツ",
    description: "上品なローズ",
    themeId: "rose-quartz",
    backgroundId: "gradient-rose",
    fontId: "mincho",
    previewColor: "#c4727e",
  },
  {
    id: "navy-sky",
    nameJa: "ミッドナイトネイビー",
    description: "シックなスカイ",
    themeId: "midnight-navy",
    backgroundId: "solid-sky",
    fontId: "zen",
    previewColor: "#4a5e8a",
  },
  {
    id: "honey-sunset",
    nameJa: "ハニーバター",
    description: "あたたかいサンセット",
    themeId: "honey-butter",
    backgroundId: "gradient-sunset",
    fontId: "rounded",
    previewColor: "#c9a84c",
  },
  {
    id: "cherry-pop",
    nameJa: "チェリーレッド",
    description: "大胆なチェリー",
    themeId: "cherry-red",
    backgroundId: "gradient-cherry",
    fontId: "sans",
    previewColor: "#c94c4c",
  },
];
