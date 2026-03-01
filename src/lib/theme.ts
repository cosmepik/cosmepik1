import type { CSSProperties } from "react";

/** 壁紙テーマ定義（背景のみ変更） */
export type ThemeId =
  | "innisfree"
  | "default"
  | "white"
  | "beige"
  | "lavender"
  | "mint"
  | "sky"
  | "coral"
  | "peach"
  | "purple"
  | "rose"
  | "sage"
  | "sand"
  | "cute"
  | "tech"
  | "feminine"
  | "pastel"
  | "blossom"
  | "sunset"
  | "ocean"
  | "forest"
  | "lavender-pink"
  | "gold-cream"
  | "morning"
  | "animated-gradient"
  | "animated-shimmer"
  | "animated-pulse"
  | "animated-aurora";

export type ThemeCategory = "solid" | "gradient" | "animated";

export interface Theme {
  id: ThemeId;
  name: string;
  category: ThemeCategory;
  /** インラインスタイル（背景など） */
  style: CSSProperties;
  /** アニメーション用の className（animated のみ） */
  className?: string;
  /** 文字色（指定時は --foreground を上書き） */
  foreground?: string;
  /** サブテキスト色（指定時は --muted-foreground を上書き） */
  mutedForeground?: string;
}

/** 単色 */
const SOLID_THEMES: Theme[] = [
  { id: "innisfree", name: "イニスフリー（デフォルト）", category: "solid", style: { backgroundColor: "#ffffff" } },
  { id: "default", name: "クリーム", category: "solid", style: { backgroundColor: "#f9f6f2" } },
  { id: "white", name: "白", category: "solid", style: { backgroundColor: "#fdfcfb" } },
  { id: "beige", name: "ベージュ", category: "solid", style: { backgroundColor: "#f5f0e8" } },
  { id: "lavender", name: "ラベンダー", category: "solid", style: { backgroundColor: "#e8e4f3" } },
  { id: "mint", name: "ミント", category: "solid", style: { backgroundColor: "#e8f5f0" } },
  { id: "sky", name: "スカイブルー", category: "solid", style: { backgroundColor: "#e3f2fd" } },
  { id: "coral", name: "コーラル", category: "solid", style: { backgroundColor: "#fce4e1" } },
  { id: "peach", name: "ピーチ", category: "solid", style: { backgroundColor: "#fdf2e9" } },
  { id: "purple", name: "パープル", category: "solid", style: { backgroundColor: "#ede7f6" } },
  { id: "rose", name: "ローズ", category: "solid", style: { backgroundColor: "#fce4ec" } },
  { id: "sage", name: "セージ", category: "solid", style: { backgroundColor: "#e8f0e8" } },
  { id: "sand", name: "サンド", category: "solid", style: { backgroundColor: "#f5f0e6" } },
];

/** グラデーション */
const GRADIENT_THEMES: Theme[] = [
  { id: "cute", name: "キュート・ピンク", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #fce7f3, #fff1f2, #fce7f3)" } },
  { id: "tech", name: "テック系", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #e2e8f0, #e0e7ff, #cbd5e1)" } },
  { id: "feminine", name: "フェミニン・ローズ", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #ffe4e6, #fdf2f8, #fffbeb)" } },
  { id: "pastel", name: "パステル・ラベンダー", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #ede9fe, #faf5ff, #fce7f3)" } },
  { id: "blossom", name: "桜・さくら", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #fce7f3, #ffe4e6, #ffedd5)" } },
  { id: "sunset", name: "サンセット", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #fde68a, #fed7aa, #fecaca)" } },
  { id: "ocean", name: "オーシャン", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #cffafe, #eff6ff, #e0e7ff)" } },
  { id: "forest", name: "フォレスト", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #d1fae5, #f0fdf4, #ccfbf1)" } },
  { id: "lavender-pink", name: "ラベンダー〜ピンク", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #ede9fe, #fdf4ff, #fce7f3)" } },
  { id: "gold-cream", name: "ゴールド〜クリーム", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #fffbeb, #f9f6f2, #fefce8)" } },
  { id: "morning", name: "モーニンググロー", category: "gradient", style: { backgroundImage: "linear-gradient(to bottom right, #fef9c3, #fffbeb, #ffedd5)" } },
];

/** アニメーション付き（globals.css のクラスを使用） */
const ANIMATED_THEMES: Theme[] = [
  { id: "animated-gradient", name: "グラデーションシフト", category: "animated", style: {}, className: "theme-bg-animated-gradient" },
  { id: "animated-shimmer", name: "キラキラ", category: "animated", style: {}, className: "theme-bg-animated-shimmer" },
  { id: "animated-pulse", name: "パルス", category: "animated", style: {}, className: "theme-bg-animated-pulse" },
  { id: "animated-aurora", name: "オーロラ", category: "animated", style: {}, className: "theme-bg-animated-aurora" },
];

/** 利用可能なテーマ一覧 */
export const THEMES: Theme[] = [...SOLID_THEMES, ...GRADIENT_THEMES, ...ANIMATED_THEMES];

export const DEFAULT_THEME_ID: ThemeId = "innisfree";
