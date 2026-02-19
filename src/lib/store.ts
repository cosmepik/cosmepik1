/**
 * データの読み書きはここを通す。
 * .env.local に Supabase の URL/Key があれば Supabase、なければ localStorage を使用。
 */
import { isSupabaseConfigured } from "@/lib/supabase";
import * as db from "@/lib/supabase-db";
import * as local from "@/lib/local-storage";
import type { ListedCosmeItem, InfluencerProfile } from "@/types";

const CURRENT_USERNAME = db.CURRENT_USERNAME;

function useSupabase() {
  return typeof window !== "undefined" && isSupabaseConfigured;
}

/** 自分のリストを取得 */
export async function getMyList(): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.fetchList(CURRENT_USERNAME);
  return Promise.resolve(local.getMyList());
}

/** 自分のリストを保存 */
export async function setMyList(list: ListedCosmeItem[]): Promise<void> {
  if (useSupabase()) {
    await db.saveList(CURRENT_USERNAME, list);
    return;
  }
  local.setMyList(list);
}

/** プロフィール取得（現在のユーザー） */
export async function getProfile(): Promise<InfluencerProfile | null> {
  if (useSupabase()) return db.fetchProfile(CURRENT_USERNAME);
  return Promise.resolve(local.getProfile());
}

/** プロフィール保存 */
export async function setProfile(
  profile: Partial<InfluencerProfile> & { username: string }
): Promise<void> {
  if (useSupabase()) {
    await db.saveProfile(profile);
    return;
  }
  local.setProfile(profile);
}

/** リストに1件追加 */
export async function addToList(
  item: Omit<ListedCosmeItem, "order" | "addedAt">
): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.addListItem(CURRENT_USERNAME, item);
  return Promise.resolve(local.addToList(item));
}

/** リストから1件削除 */
export async function removeFromList(id: string): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.removeListItem(CURRENT_USERNAME, id);
  return Promise.resolve(local.removeFromList(id));
}

/** 並び替え */
export async function reorderList(
  orderedIds: string[]
): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.reorderListItems(CURRENT_USERNAME, orderedIds);
  return Promise.resolve(local.reorderList(orderedIds));
}

/** 公開ページ用：username でプロフィール取得 */
export async function getProfileByUsername(
  username: string
): Promise<InfluencerProfile | null> {
  if (useSupabase()) return db.fetchProfile(username);
  const p = local.getProfile();
  if (!p || p.username !== username) return Promise.resolve(null);
  return Promise.resolve({ ...p, username: p.username });
}

/** 公開ページ用：username でリスト取得 */
export async function getListByUsername(
  username: string
): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.fetchList(username);
  const p = local.getProfile();
  const list = local.getMyList();
  return Promise.resolve(p?.username === username ? list : []);
}
