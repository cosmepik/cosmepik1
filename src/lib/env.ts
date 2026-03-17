/**
 * 本番環境かどうか。
 * Netlify の本番サイト（main ブランチ用）にのみ IS_PRODUCTION=true を設定し、
 * テストサイト（develop ブランチ用）では未設定のままにすることで、
 * テストサイトを検索エンジンから除外する。
 */
export const isProduction = process.env.IS_PRODUCTION === "true";
