/**
 * データの読み書きはここを通す。
 * .env.local に Supabase の URL/Key があれば Supabase、なければ localStorage を使用。
 * Supabase Auth 利用時は userId を渡すとそのユーザーのデータを扱う（未指定時は "demo"）。
 */
import { isSupabaseConfigured } from "@/lib/supabase";
import * as db from "@/lib/supabase-db";
import * as local from "@/lib/local-storage";
import type { ListedCosmeItem, InfluencerProfile } from "@/types";

const FALLBACK_USER_ID = "demo";

function useSupabase() {
  return typeof window !== "undefined" && isSupabaseConfigured;
}

function uid(userId?: string | null) {
  return userId ?? FALLBACK_USER_ID;
}

/** 自分のリストを取得（Supabase Auth 利用時は userId を渡す） */
export async function getMyList(userId?: string | null): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.fetchList(uid(userId));
  return Promise.resolve(local.getMyList());
}

/** 自分のリストを保存 */
export async function setMyList(list: ListedCosmeItem[], userId?: string | null): Promise<void> {
  if (useSupabase()) {
    await db.saveList(uid(userId), list);
    return;
  }
  local.setMyList(list);
}

/** プロフィール取得（現在のユーザー） */
export async function getProfile(userId?: string | null): Promise<InfluencerProfile | null> {
  if (useSupabase()) return db.fetchProfile(uid(userId));
  return Promise.resolve(local.getProfile());
}

/** プロフィール保存（profile.username に userId を入れて渡す） */
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
  item: Omit<ListedCosmeItem, "order" | "addedAt">,
  userId?: string | null
): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.addListItem(uid(userId), item);
  return Promise.resolve(local.addToList(item));
}

/** リストから1件削除 */
export async function removeFromList(id: string, userId?: string | null): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.removeListItem(uid(userId), id);
  return Promise.resolve(local.removeFromList(id));
}

/** 並び替え */
export async function reorderList(
  orderedIds: string[],
  userId?: string | null
): Promise<ListedCosmeItem[]> {
  if (useSupabase()) return db.reorderListItems(uid(userId), orderedIds);
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
