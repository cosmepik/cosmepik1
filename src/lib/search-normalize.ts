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

/** 先頭から除去するプロモーション文言（括弧なし） */
const LEADING_PROMO_PHRASES = [
  /^クーポン配布中\s*/,
  /^楽天ポイント[２2]倍\s*/,
  /^楽天ポイント×[２2]\s*/,
  /^楽天ポイント[２2]倍以上\s*/,
  /^ポイント[２2]倍\s*/,
  /^送料無料\s*/,
];

/**
 * 楽天APIの商品名からプロモーション文言を除去
 * 【クーポン配布中】【楽天ポイント２倍】などを先頭から削除
 */
export function sanitizeItemName(name: string): string {
  if (!name || typeof name !== "string") return "";
  let s = name.trim();
  // 【...】または[...]で囲まれたプロモーション文言を先頭から繰り返し除去
  const promoBracket =
    /^[【\[]([^】\]]*?(?:クーポン|楽天ポイント|ポイント|送料|限定|配布|倍)[^】\]]*)[】\]]\s*/;
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(promoBracket, "").trim();
    for (const re of LEADING_PROMO_PHRASES) {
      s = s.replace(re, "").trim();
    }
  }
  return s.trim() || name.trim();
}
