/**
 * プレミアムプラン判定
 * - バナー広告消去
 * - 公開ページロゴ消去
 * - 一部の壁紙解放
 */

/** プロフィールのusernameでプレミアムかどうかを取得（公開ページ用） */
export async function fetchIsPremiumByUsername(username: string): Promise<boolean> {
  if (!username?.trim()) return false;
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/premium/check?username=${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return Boolean(data?.premium);
  } catch {
    return false;
  }
}
