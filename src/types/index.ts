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

/** コスメセット（1ユーザーが複数持てる） */
export interface CosmeSet {
  id: string;
  name: string;
  /** 公開URL用の識別子（profiles/list_items の username に対応） */
  slug: string;
  itemCount?: number;
  avatarUrl?: string;
}
