/**
 * データの読み書きはここを通す。
 * .env.local に Supabase の URL/Key があれば Supabase、なければ localStorage を使用。
 * Supabase 設定時はすべて DB に保存（プロフィール・セクション・コスメセット・リスト）。
 */
import { isSupabaseConfigured } from "@/lib/supabase";
import * as db from "@/lib/supabase-db";
import * as local from "@/lib/local-storage";
import type { ListedCosmeItem, InfluencerProfile, CosmeSet } from "@/types";

const FALLBACK_USER_ID = "demo";

function useSupabase() {
  return typeof window !== "undefined" && isSupabaseConfigured;
}

const profileCache = new Map<string, { data: InfluencerProfile | null; ts: number }>();
const PROFILE_CACHE_TTL = 30_000;

/** ダッシュボード等で取得済みのプロフィールデータでキャッシュを事前セット */
export function seedProfileCache(slug: string, profile: InfluencerProfile): void {
  profileCache.set(slug, { data: profile, ts: Date.now() });
}

/** デバッグ用：現在のストレージ種別（開発時のみコンソールに出力） */
export function getStorageType(): "supabase" | "localStorage" {
  return useSupabase() ? "supabase" : "localStorage";
}

/** 接続先DBの表示用ラベル（supabase の場合は project ID を表示） */
export function getDatabaseDisplayLabel(): string {
  if (!useSupabase()) return "localStorage";
  const url = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    : "";
  if (!url) return "supabase";
  try {
    const host = new URL(url).hostname;
    const projectId = host.replace(/\.supabase\.co$/, "");
    return projectId ? `supabase: ${projectId}` : "supabase";
  } catch {
    return "supabase";
  }
}

function uid(userId?: string | null) {
  return userId ?? FALLBACK_USER_ID;
}

/** コスメセット一覧取得（Supabase 設定時は DB、未設定時は localStorage） */
export async function getCosmeSets(userId?: string | null): Promise<CosmeSet[]> {
  if (!useSupabase()) return Promise.resolve(local.getCosmeSets());
  return db.fetchCosmeSets(uid(userId));
}

/** コスメセット削除 */
export async function deleteCosmeSet(userId: string | null | undefined, slug: string): Promise<boolean> {
  if (!useSupabase()) return Promise.resolve(local.deleteCosmeSet(slug));
  return db.deleteCosmeSet(uid(userId), slug);
}

/** コスメセットの名前を更新 */
export async function updateCosmeSetName(
  userId: string | null | undefined,
  slug: string,
  name: string
): Promise<boolean> {
  if (!useSupabase()) return Promise.resolve(local.updateCosmeSetName(slug, name));
  return db.updateCosmeSetName(uid(userId), slug, name);
}

/** コスメセット作成 */
export async function createCosmeSet(
  userId: string | null | undefined,
  name: string,
  slug: string
): Promise<CosmeSet | null> {
  if (!useSupabase()) return Promise.resolve(local.createCosmeSet(name, slug));
  return db.createCosmeSet(uid(userId), name, slug);
}

/** 自分のリストを取得（slug = コスメセット識別子） */
export async function getMyList(slug?: string | null): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.getMyList(s));
  return db.fetchList(s);
}

/** 自分のリストを保存 */
export async function setMyList(list: ListedCosmeItem[], slug?: string | null): Promise<void> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) {
    local.setMyList(s, list);
    return;
  }
  await db.saveList(s, list);
}

/** プロフィール取得（slug 指定） — インメモリキャッシュ付き、サーバーAPI経由で高速 */
export async function getProfile(slug?: string | null): Promise<InfluencerProfile | null> {
  const s = slug ?? FALLBACK_USER_ID;

  const cached = profileCache.get(s);
  if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) {
    return cached.data;
  }

  if (!useSupabase()) {
    const data = local.getProfile(s);
    profileCache.set(s, { data, ts: Date.now() });
    return data;
  }

  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(s)}`);
    if (res.ok) {
      const json = await res.json();
      const data = (json.profile as InfluencerProfile) ?? null;
      profileCache.set(s, { data, ts: Date.now() });
      return data;
    }
  } catch {}

  const data = await db.fetchProfile(s);
  profileCache.set(s, { data, ts: Date.now() });
  return data;
}

/** セットの slug（公開URL）を変更 */
export async function renameCosmeSet(
  oldSlug: string,
  newSlug: string,
): Promise<boolean> {
  if (!useSupabase()) return Promise.resolve(local.renameCosmeSet(oldSlug, newSlug));
  profileCache.delete(oldSlug);
  profileCache.delete(newSlug);
  return db.renameCosmeSetSlug(oldSlug, newSlug);
}

/** プロフィール保存（profile.username に slug を入れて渡す） */
export async function setProfile(
  profile: Partial<InfluencerProfile> & { username: string }
): Promise<void> {
  profileCache.delete(profile.username);

  if (!useSupabase()) {
    local.setProfile(profile.username, profile);
    return;
  }
  try {
    await db.saveProfile(profile);
    fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: profile.username }),
    }).catch((e) => console.warn("[revalidate] failed:", e));
  } catch (err) {
    console.error("[setProfile] DB保存失敗:", err);
    throw err;
  }
}

/** リストに1件追加 */
export async function addToList(
  item: Omit<ListedCosmeItem, "order" | "addedAt">,
  slug?: string | null
): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.addToList(s, item));
  return db.addListItem(s, item);
}

/** リストから1件削除 */
export async function removeFromList(id: string, slug?: string | null): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.removeFromList(s, id));
  return db.removeListItem(s, id);
}

/** 並び替え */
export async function reorderList(
  orderedIds: string[],
  slug?: string | null
): Promise<ListedCosmeItem[]> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.reorderList(s, orderedIds));
  return db.reorderListItems(s, orderedIds);
}

/** 公開ページ用：username でプロフィール取得 */
export async function getProfileByUsername(username: string): Promise<InfluencerProfile | null> {
  if (!useSupabase()) return Promise.resolve(local.getProfile(username));
  return db.fetchProfile(username);
}

/** 公開ページ用：username でリスト取得 */
export async function getListByUsername(username: string): Promise<ListedCosmeItem[]> {
  if (!useSupabase()) return Promise.resolve(local.getMyList(username));
  return db.fetchList(username);
}

/** セクション一覧取得（slug ごと） */
export async function getSections(slug?: string | null): Promise<import("@/lib/sections").Section[] | null> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.getSections(s));
  return db.fetchSections(s);
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
  if (!useSupabase()) {
    local.setSections(s, sections);
    return;
  }
  await db.saveSections(s, sections);
  fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: s }),
  }).catch((e) => console.warn("[revalidate] failed:", e));
}
