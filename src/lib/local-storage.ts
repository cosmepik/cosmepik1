import type { ListedCosmeItem, InfluencerProfile } from "@/types";

const STORAGE_KEY_LIST = "cosmetree_my_list";
const STORAGE_KEY_PROFILE = "cosmetree_profile";

/** クライアントのみで実行するためのヘルパー */
function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/**
 * 自分のリスト（追加したコスメ一覧）を取得
 */
export function getMyList(): ListedCosmeItem[] {
  const raw = safeLocalStorage()?.getItem(STORAGE_KEY_LIST);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ListedCosmeItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 自分のリストを保存
 */
export function setMyList(list: ListedCosmeItem[]): void {
  safeLocalStorage()?.setItem(STORAGE_KEY_LIST, JSON.stringify(list));
}

/**
 * リストに1件追加（愛用コメント・order付き）
 */
export function addToList(item: Omit<ListedCosmeItem, "order" | "addedAt">): ListedCosmeItem[] {
  const current = getMyList();
  const nextOrder = current.length === 0 ? 0 : Math.max(...current.map((x) => x.order)) + 1;
  const newItem: ListedCosmeItem = {
    ...item,
    order: nextOrder,
    addedAt: new Date().toISOString(),
  };
  const next = [...current, newItem];
  setMyList(next);
  return next;
}

/**
 * プロフィールを取得（username など。公開ページ用）
 */
export function getProfile(): InfluencerProfile | null {
  const raw = safeLocalStorage()?.getItem(STORAGE_KEY_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InfluencerProfile;
  } catch {
    return null;
  }
}

/**
 * プロフィールを保存
 */
export function setProfile(profile: Partial<InfluencerProfile> & { username: string }): void {
  const existing = getProfile();
  const merged: InfluencerProfile = {
    username: profile.username ?? existing?.username ?? "user",
    displayName: profile.displayName ?? existing?.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? existing?.avatarUrl,
    bio: profile.bio ?? existing?.bio,
    skinType: profile.skinType ?? existing?.skinType,
    personalColor: profile.personalColor ?? existing?.personalColor,
    list: existing?.list ?? [],
    updatedAt: new Date().toISOString(),
  };
  safeLocalStorage()?.setItem(STORAGE_KEY_PROFILE, JSON.stringify(merged));
}

/**
 * リストから id で削除
 */
export function removeFromList(id: string): ListedCosmeItem[] {
  const current = getMyList().filter((x) => x.id !== id);
  setMyList(current);
  return current;
}

/**
 * 並び替え後のリストを保存（order を 0,1,2... で振り直す）
 */
export function reorderList(orderedIds: string[]): ListedCosmeItem[] {
  const current = getMyList();
  const byId = new Map(current.map((x) => [x.id, x]));
  const next: ListedCosmeItem[] = orderedIds
    .map((id, index) => {
      const item = byId.get(id);
      if (!item) return null;
      return { ...item, order: index };
    })
    .filter((x): x is ListedCosmeItem => x != null);
  setMyList(next);
  return next;
}
