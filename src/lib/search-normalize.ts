/**
 * 検索用のテキスト正規化
 * ひらがな⇔カタカナ、大文字⇔小文字を区別せずマッチするようにする
 */

/** ひらがなをカタカナに変換（ぁ-ゖ、ゝ-ゟ） */
function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u309F]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String.fromCharCode(code + 0x60);
  });
}

/** カタカナをひらがなに変換（ァ-ヶ、ヽ-ヿ） */
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30FF]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String.fromCharCode(code - 0x60);
  });
}

/**
 * 検索用に正規化する（比較用）
 * ひらがな・カタカナをひらがなに統一、英数字は小文字に
 */
export function normalizeForSearch(text: string): string {
  if (!text) return "";
  const lower = text.toLowerCase().trim();
  return katakanaToHiragana(lower);
}

/**
 * 検索キーワードを楽天API用に変換する（カタカナ版）
 * 商品名はカタカナ表記が多いため、ひらがな→カタカナに変換して試す
 */
export function toKatakanaForApi(keyword: string): string {
  if (!keyword.trim()) return keyword;
  return hiraganaToKatakana(keyword.trim());
}

/**
 * 検索キーワードを楽天API用に変換する（ひらがな版）
 */
export function toHiraganaForApi(keyword: string): string {
  if (!keyword.trim()) return keyword;
  return katakanaToHiragana(keyword.trim());
}

/** 除去するプロモーション文言（単独・前後スペース含む） */
const REMOVE_PHRASES = [
  "送料無料",
  "公式",
  "正規品",
  "ポイント倍",
  "ポイント２倍",
  "ポイント2倍",
  "クーポン配布中",
  "楽天ポイント２倍",
  "楽天ポイント2倍",
  "楽天ポイント×２",
  "楽天ポイント×2",
  "楽天ポイント倍",
  "楽天ポイント倍以上",
  "ポイント倍以上",
];

/** 括弧付き【】[] のプロモーション文言を除去する正規表現 */
const BRACKET_PATTERN = /[【\[]([^】\]]*)[】\]]/g;

/**
 * 楽天APIの商品名をクレンジング
 * - 括弧付き（【】[]）のプロモーション文言を除去
 * - 送料無料・公式・正規品・ポイント倍・クーポン配布中などを除去
 * - 余分なスペースを整理
 */
export function cleanseItemName(name: string): string {
  if (!name || typeof name !== "string") return "";
  let s = name.trim();

  // 1. 【...】[...] の括弧ブロックを全て除去
  s = s.replace(BRACKET_PATTERN, " ").trim();

  // 2. 除去文言を繰り返し削除（大小・全角半角のバリエーション含む）
  let prev = "";
  while (prev !== s) {
    prev = s;
    for (const phrase of REMOVE_PHRASES) {
      const re = new RegExp(phrase.replace(/[２2]/g, "[２2]"), "gi");
      s = s.replace(re, " ").trim();
    }
  }

  // 3. 連続スペース・前後のスペースを整理
  s = s.replace(/\s+/g, " ").trim();

  return s || name.trim();
}

/**
 * クレンジング後の文字列から「ブランド名 + 商品名」を抽出
 * 区切り文字（　｜|／/）の前がブランド、後が商品名
 */
export function parseBrandAndProduct(cleansed: string): { brand: string; product: string } {
  if (!cleansed || typeof cleansed !== "string") {
    return { brand: "", product: "" };
  }
  const s = cleansed.trim();
  const separators = ["　", " ", "｜", "|", "／", "/"];
  let cut = s.length;
  for (const sep of separators) {
    const i = s.indexOf(sep);
    if (i > 0 && i < cut) cut = i;
  }
  const brand = s.slice(0, cut).trim();
  const product = s.slice(cut).replace(/^[\s　｜|／/]+/, "").trim();
  return {
    brand: brand || "",
    product: product || s,
  };
}

/** @deprecated sanitizeItemName の後方互換（cleanseItemName を使用） */
export function sanitizeItemName(name: string): string {
  return cleanseItemName(name);
}
