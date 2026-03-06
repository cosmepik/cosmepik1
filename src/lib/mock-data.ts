import type { CosmeItem } from "@/types";
import { normalizeForSearch } from "@/lib/search-normalize";

/** カテゴリ別のプレースホルダー画像（placehold.co） */
const IMG = {
  lip: "https://placehold.co/128x128/fce4ec/e91e63?text=Lip",
  base: "https://placehold.co/128x128/f5f0e6/d4a574?text=Base",
  toner: "https://placehold.co/128x128/e0f7fa/00acc1?text=Toner",
  serum: "https://placehold.co/128x128/f3e5f5/8e24aa?text=Serum",
  cream: "https://placehold.co/128x128/fff8e1/ffa000?text=Cream",
  mascara: "https://placehold.co/128x128/263238/37474f?text=Mascara",
  blush: "https://placehold.co/128x128/ffebee/f44336?text=Blush",
  eye: "https://placehold.co/128x128/ede7f6/5e35b1?text=Eye",
  cleanser: "https://placehold.co/128x128/e8f5e9/43a047?text=Wash",
  sunscreen: "https://placehold.co/128x128/fff3e0/ff9800?text=UV",
} as const;

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
    imageUrl: IMG.lip,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/1",
    amazonUrl: "https://www.amazon.co.jp/dummy/1",
  },
  {
    id: "mock-2",
    name: "スキン ファウンデーション ヌード",
    brand: "SHISEIDO",
    category: "ファンデーション",
    imageUrl: IMG.base,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/2",
    amazonUrl: "https://www.amazon.co.jp/dummy/2",
  },
  {
    id: "mock-3",
    name: "エリクシール シュペリエル ローション",
    brand: "SHISEIDO",
    category: "化粧水",
    imageUrl: IMG.toner,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/3",
    amazonUrl: "https://www.amazon.co.jp/dummy/3",
  },
  {
    id: "mock-4",
    name: "ヴィタリティ リップ ティント",
    brand: "CANMAKE",
    category: "リップ",
    imageUrl: IMG.lip,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/4",
    amazonUrl: "https://www.amazon.co.jp/dummy/4",
  },
  {
    id: "mock-5",
    name: "パーフェクト ウォーター ベース",
    brand: "CANMAKE",
    category: "ファンデーション",
    imageUrl: IMG.base,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/5",
    amazonUrl: "https://www.amazon.co.jp/dummy/5",
  },
  {
    id: "mock-6",
    name: "ハイドレーティング トナー",
    brand: "Curel",
    category: "化粧水",
    imageUrl: IMG.toner,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/6",
    amazonUrl: "https://www.amazon.co.jp/dummy/6",
  },
  {
    id: "mock-7",
    name: "モイスチャー エッセンス",
    brand: "Curel",
    category: "美容液",
    imageUrl: IMG.serum,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/7",
    amazonUrl: "https://www.amazon.co.jp/dummy/7",
  },
  {
    id: "mock-8",
    name: "フェイスクリーム しっとり",
    brand: "Curel",
    category: "乳液",
    imageUrl: IMG.cream,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/8",
    amazonUrl: "https://www.amazon.co.jp/dummy/8",
  },
  {
    id: "mock-9",
    name: "スーパーウォーター ジェル",
    brand: "KATE",
    category: "化粧水",
    imageUrl: IMG.toner,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/9",
    amazonUrl: "https://www.amazon.co.jp/dummy/9",
  },
  {
    id: "mock-10",
    name: "ザ ベースメイク ファンデーション",
    brand: "KATE",
    category: "ファンデーション",
    imageUrl: IMG.base,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/10",
    amazonUrl: "https://www.amazon.co.jp/dummy/10",
  },
  {
    id: "mock-11",
    name: "リップモンスター グロス",
    brand: "KATE",
    category: "リップ",
    imageUrl: IMG.lip,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/11",
    amazonUrl: "https://www.amazon.co.jp/dummy/11",
  },
  {
    id: "mock-12",
    name: "オイルイン リップスティック",
    brand: "CEZANNE",
    category: "リップ",
    imageUrl: IMG.lip,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/12",
    amazonUrl: "https://www.amazon.co.jp/dummy/12",
  },
  {
    id: "mock-13",
    name: "パーフェクトフィット ファンデーション",
    brand: "CEZANNE",
    category: "ファンデーション",
    imageUrl: IMG.base,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/13",
    amazonUrl: "https://www.amazon.co.jp/dummy/13",
  },
  {
    id: "mock-14",
    name: "オイルクレンジング",
    brand: "DHC",
    category: "クレンジング",
    imageUrl: IMG.cleanser,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/14",
    amazonUrl: "https://www.amazon.co.jp/dummy/14",
  },
  {
    id: "mock-15",
    name: "ディープクレンジングオイル",
    brand: "DHC",
    category: "クレンジング",
    imageUrl: IMG.cleanser,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/15",
    amazonUrl: "https://www.amazon.co.jp/dummy/15",
  },
  {
    id: "mock-16",
    name: "グリーンティー セラム",
    brand: "innisfree",
    category: "美容液",
    imageUrl: IMG.serum,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/16",
    amazonUrl: "https://www.amazon.co.jp/dummy/16",
  },
  {
    id: "mock-17",
    name: "ビタミンC ブライトニング セラム",
    brand: "innisfree",
    category: "美容液",
    imageUrl: IMG.serum,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/17",
    amazonUrl: "https://www.amazon.co.jp/dummy/17",
  },
  {
    id: "mock-18",
    name: "カールキープ マスカラ",
    brand: "KISS ME",
    category: "マスカラ",
    imageUrl: IMG.mascara,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/18",
    amazonUrl: "https://www.amazon.co.jp/dummy/18",
  },
  {
    id: "mock-19",
    name: "チーク パウダー ピンク",
    brand: "CANMAKE",
    category: "チーク",
    imageUrl: IMG.blush,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/19",
    amazonUrl: "https://www.amazon.co.jp/dummy/19",
  },
  {
    id: "mock-20",
    name: "アイシャドウ パレット ベージュ",
    brand: "CANMAKE",
    category: "アイシャドウ",
    imageUrl: IMG.eye,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/20",
    amazonUrl: "https://www.amazon.co.jp/dummy/20",
  },
  {
    id: "mock-21",
    name: "ウォータリー サンジェル",
    brand: "BIORE",
    category: "日焼け止め",
    imageUrl: IMG.sunscreen,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/21",
    amazonUrl: "https://www.amazon.co.jp/dummy/21",
  },
  {
    id: "mock-22",
    name: "アスリズム ウォーターエッセンス",
    brand: "BIORE",
    category: "日焼け止め",
    imageUrl: IMG.sunscreen,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/22",
    amazonUrl: "https://www.amazon.co.jp/dummy/22",
  },
  {
    id: "mock-23",
    name: "ヒアルロン ローション",
    brand: "HADA LABO",
    category: "化粧水",
    imageUrl: IMG.toner,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/23",
    amazonUrl: "https://www.amazon.co.jp/dummy/23",
  },
  {
    id: "mock-24",
    name: "スーパーヒアルロン 乳液",
    brand: "HADA LABO",
    category: "乳液",
    imageUrl: IMG.cream,
    rakutenUrl: "https://www.rakuten.co.jp/dummy/24",
    amazonUrl: "https://www.amazon.co.jp/dummy/24",
  },
];

/**
 * キーワードでダミー商品を検索する（商品名・ブランド・カテゴリの部分一致）
 * ひらがな・カタカナ・大文字小文字を区別しない
 * 該当なしの場合は先頭12件を返す（必ず何か表示されるようにする）
 */
export function searchMockCosme(keyword: string): CosmeItem[] {
  if (!keyword.trim()) return [];
  const k = normalizeForSearch(keyword);
  const matched = MOCK_COSME_ITEMS.filter((item) => {
    const nameNorm = normalizeForSearch(item.name);
    const brandNorm = normalizeForSearch(item.brand);
    const categoryNorm = normalizeForSearch(item.category);
    return nameNorm.includes(k) || brandNorm.includes(k) || categoryNorm.includes(k);
  });
  return matched.length > 0 ? matched : MOCK_COSME_ITEMS.slice(0, 12);
}
