/**
 * ダミー検索用・楽天API用の商品型（将来APIに合わせて拡張）
 */
export interface CosmeItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  /** 楽天/AmazonのアフィリエイトURL（ダミー用） */
  rakutenUrl?: string;
  amazonUrl?: string;
}

/**
 * インフルエンサーがリストに追加したアイテム（愛用コメント付き）
 */
export interface ListedCosmeItem extends CosmeItem {
  comment: string;
  order: number;
  addedAt: string; // ISO date
}

/** SNSリンク */
export interface SnsLink {
  id: string;
  type: "instagram" | "twitter" | "youtube" | "tiktok" | "threads" | "custom";
  label: string;
  url: string;
}

/**
 * 公開プロフィール用のユーザー情報（localStorage / 将来Supabase）
 */
export interface InfluencerProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  /** 背景画像（data URL または外部URL。スマホフォルダからアップロード可） */
  backgroundImageUrl?: string;
  /** テーマ壁紙を使用中（true のとき背景オーバーレイを非表示、アップロード写真は保持） */
  usePreset?: boolean;
  /** テーマID（色味） */
  themeId?: string;
  /** 背景ID（壁紙・グラデーション等） */
  backgroundId?: string;
  /** フォントID */
  fontId?: string;
  /** コスメカードデザインID */
  cardDesignId?: string;
  /** カードカラー（空＝デフォルト、"transparent"＝透明、hex＝カスタム色） */
  cardColor?: string;
  /** テキストカラー（空＝テーマデフォルト、hex＝カスタム色） */
  textColor?: string;
  bio?: string;
  /** サブテキスト（ひとこと） */
  bioSub?: string;
  /** 肌質（例：乾燥肌、混合肌） */
  skinType?: string;
  /** パーソナルカラー（例：イエベ、ブルベ） */
  personalColor?: string;
  /** SNSリンク一覧 */
  snsLinks?: SnsLink[];
  /** 楽天アフィリエイトID（確率分散型レベニューシェア用） */
  rakutenAffiliateId?: string;
  list?: ListedCosmeItem[];
  updatedAt: string;
}

export type CosmeSetMode = "simple" | "recipe";

/** コスメセット（1ユーザーが複数持てる） */
export interface CosmeSet {
  id: string;
  name: string;
  /** 公開URL用の識別子（profiles/list_items の username に対応） */
  slug: string;
  itemCount?: number;
  avatarUrl?: string;
  /** プロフィール表示名（APIから返る） */
  displayName?: string;
  /** セットのモード（simple=従来リスト, recipe=メイクレシピ） */
  mode?: CosmeSetMode;
}
