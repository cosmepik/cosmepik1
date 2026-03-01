import type { CosmeItem } from "@/types";

/**
 * 楽天API未連携時のダミーコスメデータ。
 * 検索はこの配列をキーワード（商品名・ブランド・カテゴリ）でフィルタする。
 */
export const MOCK_COSME_ITEMS: CosmeItem[] = [
  {
    id: "mock-1",
    name: "ルージュヴォリエ ルージュ ドラマティック",
    brand: "SHISEIDO",
    category: "リップ",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/1",
    amazonUrl: "https://www.amazon.co.jp/dummy/1",
  },
  {
    id: "mock-2",
    name: "スキン ファウンデーション ヌード",
    brand: "SHISEIDO",
    category: "ファンデーション",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/2",
    amazonUrl: "https://www.amazon.co.jp/dummy/2",
  },
  {
    id: "mock-3",
    name: "エリクシール シュペリエル ローション",
    brand: "SHISEIDO",
    category: "化粧水",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/3",
    amazonUrl: "https://www.amazon.co.jp/dummy/3",
  },
  {
    id: "mock-4",
    name: "ヴィタリティ リップ ティント",
    brand: "CANMAKE",
    category: "リップ",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/4",
    amazonUrl: "https://www.amazon.co.jp/dummy/4",
  },
  {
    id: "mock-5",
    name: "パーフェクト ウォーター ベース",
    brand: "CANMAKE",
    category: "ファンデーション",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/5",
    amazonUrl: "https://www.amazon.co.jp/dummy/5",
  },
  {
    id: "mock-6",
    name: "ハイドレーティング トナー",
    brand: "Curel",
    category: "化粧水",
    imageUrl: "/cosme-placeholder.svg",
    rakutenUrl: "https://www.rakuten.co.jp/dummy/6",
    amazonUrl: "https://www.amazon.co.jp/dummy/6",
  },
];

/**
 * キーワードでダミー商品を検索する（商品名・ブランド・カテゴリの部分一致）
 */
export function searchMockCosme(keyword: string): CosmeItem[] {
  if (!keyword.trim()) return [];
  const k = keyword.trim().toLowerCase();
  return MOCK_COSME_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(k) ||
      item.brand.toLowerCase().includes(k) ||
      item.category.toLowerCase().includes(k)
  );
}
