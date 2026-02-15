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

/**
 * 公開プロフィール用のユーザー情報（localStorage / 将来Supabase）
 */
export interface InfluencerProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  /** 肌質（例：乾燥肌、混合肌） */
  skinType?: string;
  /** パーソナルカラー（例：イエベ、ブルベ） */
  personalColor?: string;
  list?: ListedCosmeItem[];
  updatedAt: string;
}
