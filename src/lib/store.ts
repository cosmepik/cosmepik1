/**
 * データの読み書きはここを通す。
 * .env.local に Supabase の URL/Key があれば Supabase、なければ localStorage を使用。
 * Supabase Auth 利用時は userId を渡すとそのユーザーのデータを扱う（未指定時は "demo"）。
 */
import { isSupabaseConfigured } from "@/lib/supabase";
import * as db from "@/lib/supabase-db";
import * as local from "@/lib/local-storage";
import type { ListedCosmeItem, InfluencerProfile, CosmeSet } from "@/types";

const FALLBACK_USER_ID = "demo";

function useSupabase() {
  return typeof window !== "undefined" && isSupabaseConfigured;
}

function uid(userId?: string | null) {
  return userId ?? FALLBACK_USER_ID;
}

/** デモユーザーは常に localStorage を使用（Supabase 未設定時も、cosme_sets 未作成時も確実に動作） */
function useLocalForCosmeSets(userId?: string | null) {
  return uid(userId) === "demo";
}

/** デモモード（とりあえずつかってみる）: cookie で判定 */
function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("cosmepik_demo=1");
}

/** コスメセット一覧取得（Supabase 時は userId、localStorage 時は "demo"） */
export async function getCosmeSets(userId?: string | null): Promise<CosmeSet[]> {
  if (useLocalForCosmeSets(userId) || !useSupabase()) return Promise.resolve(local.getCosmeSets());
  const dbSets = await db.fetchCosmeSets(uid(userId));
  const localSets = local.getCosmeSets();
  const dbSlugs = new Set(dbSets.map((s) => s.slug));
  const localOnly = localSets.filter((s) => !dbSlugs.has(s.slug));
  return [...dbSets, ...localOnly];
}

/** コスメセット削除 */
export async function deleteCosmeSet(userId: string | null | undefined, slug: string): Promise<boolean> {
  const u = uid(userId);
  if (useLocalForCosmeSets(userId) || !useSupabase()) {
    return Promise.resolve(local.deleteCosmeSet(slug));
  }
  const ok = await db.deleteCosmeSet(u, slug);
  if (ok) return true;
  if (u === "demo") return local.deleteCosmeSet(slug);
  return false;
}

/** コスメセット作成 */
export async function createCosmeSet(
  userId: string | null | undefined,
  name: string,
  slug: string
): Promise<CosmeSet | null> {
  const u = uid(userId);
  if (useLocalForCosmeSets(userId) || !useSupabase()) return Promise.resolve(local.createCosmeSet(name, slug));
  const result = await db.createCosmeSet(u, name, slug);
  if (result) return result;
  // Supabase 失敗時（cosme_sets テーブル未作成・RLS等）: localStorage にフォールバックして作成を継続
  return local.createCosmeSet(name, slug);
}

/** 自分のリストを取得（slug = コスメセット識別子） */
export async function getMyList(slug?: string | null): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.getMyList(s));
  }
  return db.fetchList(s);
}

/** 自分のリストを保存 */
export async function setMyList(list: ListedCosmeItem[], slug?: string | null): Promise<void> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    local.setMyList(s, list);
    return;
  }
  await db.saveList(s, list);
}

/** プロフィール取得（slug 指定） */
export async function getProfile(slug?: string | null): Promise<InfluencerProfile | null> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.getProfile(s));
  }
  return db.fetchProfile(s);
}

/** セットの slug（公開URL）を変更 */
export async function renameCosmeSet(
  oldSlug: string,
  newSlug: string,
  userId?: string | null
): Promise<boolean> {
  if (useLocalForCosmeSets(userId) || !useSupabase()) {
    return Promise.resolve(local.renameCosmeSet(oldSlug, newSlug));
  }
  // Supabase 時は未実装（複雑なため）
  return false;
}

/** プロフィール保存（profile.username に slug を入れて渡す） */
export async function setProfile(
  profile: Partial<InfluencerProfile> & { username: string }
): Promise<void> {
  const slug = profile.username;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(slug)) {
    local.setProfile(slug, profile);
    return;
  }
  await db.saveProfile(profile);
}

/** リストに1件追加 */
export async function addToList(
  item: Omit<ListedCosmeItem, "order" | "addedAt">,
  slug?: string | null
): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  // ローカルにセットがあればローカルへ追加（getCosmeSets とデータソースを一致させる）
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.addToList(s, item));
  }
  return db.addListItem(s, item);
}

/** リストから1件削除 */
export async function removeFromList(id: string, slug?: string | null): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.removeFromList(s, id));
  }
  return db.removeListItem(s, id);
}

/** 並び替え */
export async function reorderList(
  orderedIds: string[],
  slug?: string | null
): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.reorderList(s, orderedIds));
  }
  return db.reorderListItems(s, orderedIds);
}

/** 公開ページ用：username でプロフィール取得 */
export async function getProfileByUsername(
  username: string
): Promise<InfluencerProfile | null> {
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(username)) {
    return Promise.resolve(local.getProfile(username));
  }
  return db.fetchProfile(username);
}

/** 公開ページ用：username でリスト取得 */
export async function getListByUsername(
  username: string
): Promise<ListedCosmeItem[]> {
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(username)) {
    return Promise.resolve(local.getMyList(username));
  }
  return db.fetchList(username);
}

/** セクション一覧取得（slug ごと） */
export async function getSections(slug?: string | null): Promise<import("@/lib/sections").Section[] | null> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    return Promise.resolve(local.getSections(s));
  }
  return null;
}

/** セクションにアイテムを追加（検索ページ用） */
export async function addItemToSection(
  slug: string,
  sectionId: string,
  item: { product: string; brand?: string; image?: string; link?: string; label?: string }
): Promise<boolean> {
  const sections = await getSections(slug);
  if (!sections || sections.length === 0) return false;
  const section = sections.find((s) => s.id === sectionId);
  if (!section || !["routine", "products"].includes(section.type)) return false;

  const sectionItem: import("@/lib/sections").SectionItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    product: item.product,
    brand: item.brand,
    image: item.image,
    link: item.link,
    label: item.label,
  };
  const next = sections.map((s) =>
    s.id === sectionId ? { ...s, items: [...s.items, sectionItem] } : s
  );
  await setSections(next, slug);
  return true;
}

/** セクション一覧保存（slug ごと） */
export async function setSections(
  sections: import("@/lib/sections").Section[],
  slug?: string | null
): Promise<void> {
  const s = slug ?? FALLBACK_USER_ID;
  if (isDemoMode() || !useSupabase() || local.hasSetInLocal(s)) {
    local.setSections(s, sections);
    return;
  }
}
