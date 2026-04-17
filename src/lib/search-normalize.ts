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
  "数量限定",
  "期間限定",
  "韓国コスメ",
  "特価！",
  "特価!",
  "特価",
  "スーパーSALE",
  "セット販売",
  "追跡番号",
  "追跡番号あり",
  "追跡",
  "◎",
  "再入荷",
  "割引クーポン",
  "⚫️",
  "！",
  "!",
  "楽天",
  "楽天一位",
  "即日発送",
];

/** 括弧付き【】[]「」のプロモーション文言を除去する正規表現 */
const BRACKET_PATTERN = /[【\[「]([^】\]」]*)[】\]」]/g;

/** 《》の括弧付き文言を除去 */
const ANGLE_BRACKET_PATTERN = /《[^》]*》/g;

/** %クーポン（10%クーポン、%クーポン など）を除去 */
const COUPON_PATTERN = /\d*%クーポン/gi;

/** ★に続く文言を除去（★送料無料、★5つ星 など。スペースまたは末尾で区切られた場合のみ） */
const STAR_PATTERN = /★\s*[^\s★]+(?=\s|$)/g;

/** ◎に続く文言を除去（◎送料無料 など） */
const CIRCLE_PATTERN = /◎\s*[^\s◎]+(?=\s|$)/g;

/** %OFF、MAX 円 などの割引・価格表記を除去 */
const DISCOUNT_PATTERNS = [
  /\d+%OFF/gi,
  /\d+％OFF/gi,
  /MAX\s*[\d,，]+円?/gi,
  /MAX\s*[\d,，]+/gi,
];

/** ポイント　倍　など（スペース入り・数字入り）を除去 */
const POINT_BAI_PATTERNS = [
  /楽天?ポイント[\s　]*[×xX]?[\s　]*[２2]?[\s　]*倍/gi,
  /ポイント[\s　]+倍/gi,
  /ポイント[\d１２３４５６７８９０〇○×xX\s　]*倍/gi,
];

/** 日付表記を除去（2024/1/15、1/31、1月15日、〜1/15まで など）※1.5ml等は除外 */
const DATE_PATTERNS = [
  /\d{4}[\-\/\.]\d{1,2}[\-\/\.]\d{1,2}/g,
  /\d{1,2}[\-\/]\d{1,2}(?:[\-\/]\d{1,2})?/g,
  /\d{1,2}月\d{1,2}日?/g,
  /(?:〜|～)?\d{1,2}[\-\/]\d{1,2}(?:まで)?/g,
  /(?:〜|～)\d{1,2}月\d{1,2}日?(?:まで)?/g,
];

/** 時間表記を除去（12:00、23:59、午前中、日中 など） */
const TIME_PATTERNS = [
  /\d{1,2}:\d{2}(?::\d{2})?/g,
  /午前中|午後|日中|夜間/gi,
  /\d{1,2}時(?:頃|〜|～)?/g,
];

/**
 * 楽天APIの商品名をクレンジング
 * - 括弧付き（【】[]）のプロモーション文言を除去
 * - ★に続く文言、%OFF、MAX円、数量限定などを除去
 * - 余分なスペースを整理
 */
export function cleanseItemName(name: string): string {
  if (!name || typeof name !== "string") return "";
  let s = name.trim();

  // 1. 【...】[...]《》の括弧ブロックを全て除去
  s = s.replace(BRACKET_PATTERN, " ").trim();
  s = s.replace(ANGLE_BRACKET_PATTERN, " ").trim();

  // 2. ★・◎に続く文言を除去
  s = s.replace(STAR_PATTERN, " ").trim();
  s = s.replace(CIRCLE_PATTERN, " ").trim();

  // 3. %OFF、MAX 円、%クーポン などを除去
  for (const re of DISCOUNT_PATTERNS) {
    s = s.replace(re, " ").trim();
  }
  s = s.replace(COUPON_PATTERN, " ").trim();

  // 4. ポイント　倍　（スペース入り）を除去
  for (const re of POINT_BAI_PATTERNS) {
    s = s.replace(re, " ").trim();
  }

  // 5. 日付・時間表記を除去
  for (const re of DATE_PATTERNS) {
    s = s.replace(re, " ").trim();
  }
  for (const re of TIME_PATTERNS) {
    s = s.replace(re, " ").trim();
  }

  // 6. 除去文言を繰り返し削除
  let prev = "";
  while (prev !== s) {
    prev = s;
    for (const phrase of REMOVE_PHRASES) {
      const re = new RegExp(phrase.replace(/[２2]/g, "[２2]"), "gi");
      s = s.replace(re, " ").trim();
    }
  }

  // 7. 残った★・◎を除去
  s = s.replace(/★/g, " ").trim();
  s = s.replace(/◎/g, " ").trim();

  // 8. 連続スペース・前後のスペースを整理
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
