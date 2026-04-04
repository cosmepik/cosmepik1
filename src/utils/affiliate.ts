/**
 * 楽天アフィリエイトの確率分散型レベニューシェア
 * - ユーザーIDが未設定 → 運営100%
 * - ユーザーIDが設定済み → ユーザー60% / 運営40%
 */

const RAKUTEN_AFL_BASE = "https://hb.afl.rakuten.co.jp/hgc/";
/** 楽天アフィリエイトID形式: 英数字とドット（例: 0ea12345.ab.cd） */
const AFFILIATE_ID_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9.]*[a-zA-Z0-9]$/;

function isValidAffiliateId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim();
  return trimmed.length >= 5 && AFFILIATE_ID_REGEX.test(trimmed);
}

/**
 * 既存の楽天アフィリエイトURLから商品URLを抽出
 */
function extractProductUrlFromAffiliate(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("rakuten")) return null;
    const pc = u.searchParams.get("pc") ?? u.searchParams.get("m");
    if (pc) return decodeURIComponent(pc);
    if (u.hostname.includes("item.rakuten.co.jp")) return url;
    return null;
  } catch {
    return null;
  }
}

/**
 * 楽天商品URLかどうか
 */
function isRakutenProductUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("item.rakuten.co.jp") ||
      u.hostname.includes("hb.afl.rakuten.co.jp") ||
      u.hostname.includes("search.rakuten.co.jp") ||
      u.hostname.includes("product.rakuten.co.jp")
    );
  } catch {
    return false;
  }
}

/**
 * 楽天アフィリエイトリンクを生成（確率分散型）
 * @param userAffiliateId - ユーザーの楽天アフィリエイトID（profiles.rakuten_affiliate_id）
 * @param itemUrl - 商品URL（楽天の商品ページ、または既存のアフィリエイトURL）
 * @returns { url, usedId: "user" | "admin" }
 */
export function generateAffiliateLink(
  userAffiliateId: string | null,
  itemUrl: string
): { url: string; usedId: "user" | "admin" } {
  const adminId =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_RAKUTEN_ID?.trim()) ||
    "";

  const hasValidUserId = userAffiliateId != null && isValidAffiliateId(userAffiliateId);
  const userRate =
    parseFloat(
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_USER_REVENUE_SHARE_RATE) || "0.6"
    ) || 0.6;

  const useUser = hasValidUserId && Math.random() < userRate;
  const affiliateId = useUser && userAffiliateId ? userAffiliateId.trim() : adminId;

  if (!isRakutenProductUrl(itemUrl)) {
    return { url: itemUrl, usedId: useUser ? "user" : "admin" };
  }

  let productUrl = itemUrl;
  if (itemUrl.includes("hb.afl.rakuten.co.jp")) {
    const extracted = extractProductUrlFromAffiliate(itemUrl);
    if (extracted) productUrl = extracted;
  }

  const encoded = encodeURIComponent(productUrl);
  const url =
    affiliateId && isValidAffiliateId(affiliateId)
      ? `${RAKUTEN_AFL_BASE}${affiliateId}/?pc=${encoded}`
      : productUrl;

  return { url, usedId: useUser ? "user" : "admin" };
}
