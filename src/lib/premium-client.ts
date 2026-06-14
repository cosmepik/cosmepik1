/** ログイン中ユーザーのプレミアム状態（クライアント用・セッション内キャッシュ） */

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

/** プレミアム会員かどうか。未ログインは false。結果はセッション内でキャッシュする。 */
export async function isPremiumUser(): Promise<boolean> {
  if (cached !== null) return cached;
  if (!inflight) {
    inflight = fetch("/api/premium/me")
      .then((r) => r.json())
      .then((d: { premium?: boolean }) => {
        cached = !!d.premium;
        return cached;
      })
      .catch(() => {
        cached = false;
        return false;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}
