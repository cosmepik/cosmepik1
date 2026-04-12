/**
 * データの読み書きはここを通す。
 * .env.local に Supabase の URL/Key があれば Supabase、なければ localStorage を使用。
 * Supabase 設定時はすべて DB に保存（プロフィール・セクション・メイクレシピ・リスト）。
 */
import { isSupabaseConfigured } from "@/lib/supabase";
import * as db from "@/lib/supabase-db";
import * as local from "@/lib/local-storage";
import type { ListedCosmeItem, InfluencerProfile, CosmeSet, CosmeSetMode } from "@/types";

const FALLBACK_USER_ID = "demo";

function useSupabase() {
  return typeof window !== "undefined" && isSupabaseConfigured;
}

const profileCache = new Map<string, { data: InfluencerProfile | null; ts: number }>();
const PROFILE_CACHE_TTL = 30_000;

const sectionsCache = new Map<string, { data: import("@/lib/sections").Section[]; ts: number }>();
const SECTIONS_CACHE_TTL = 30_000;

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

/** メイクレシピ一覧取得（Supabase 設定時は DB、未設定時は localStorage） */
export async function getCosmeSets(userId?: string | null): Promise<CosmeSet[]> {
  if (!useSupabase()) return Promise.resolve(local.getCosmeSets());
  return db.fetchCosmeSets(uid(userId));
}

/** メイクレシピ削除 */
export async function deleteCosmeSet(userId: string | null | undefined, slug: string): Promise<boolean> {
  if (!useSupabase()) return Promise.resolve(local.deleteCosmeSet(slug));
  return db.deleteCosmeSet(uid(userId), slug);
}

/** メイクレシピの名前を更新 */
export async function updateCosmeSetName(
  userId: string | null | undefined,
  slug: string,
  name: string
): Promise<boolean> {
  if (!useSupabase()) return Promise.resolve(local.updateCosmeSetName(slug, name));
  return db.updateCosmeSetName(uid(userId), slug, name);
}

/** メイクレシピ作成 */
export async function createCosmeSet(
  userId: string | null | undefined,
  name: string,
  slug: string,
  mode: CosmeSetMode = "simple",
): Promise<CosmeSet | null> {
  if (!useSupabase()) return Promise.resolve(local.createCosmeSet(name, slug));
  return db.createCosmeSet(uid(userId), name, slug, mode);
}

/** 自分のリストを取得（slug = メイクレシピ識別子） */
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
      const now = Date.now();
      profileCache.set(s, { data, ts: now });
      if (Array.isArray(json.sections)) {
        sectionsCache.set(s, { data: json.sections, ts: now });
      }
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
  sectionsCache.delete(oldSlug);
  sectionsCache.delete(newSlug);
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
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: profile.username }),
      });
    } catch (e) {
      console.warn("[revalidate] failed:", e);
    }
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

/** セクション一覧取得（slug ごと）— インメモリキャッシュ付き
 *  エラー時は stale キャッシュを返すか、"error" を返す */
export async function getSections(slug?: string | null): Promise<import("@/lib/sections").Section[] | null | "error"> {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) return Promise.resolve(local.getSections(s));

  const cached = sectionsCache.get(s);
  if (cached && Date.now() - cached.ts < SECTIONS_CACHE_TTL) {
    return cached.data;
  }

  try {
    const data = await db.fetchSections(s);
    if (data) {
      sectionsCache.set(s, { data, ts: Date.now() });
    }
    return data;
  } catch (err) {
    console.error("[getSections] fetch failed, returning stale cache:", err);
    if (cached) return cached.data;
    return "error";
  }
}

/** キャッシュクリア（リトライ前に使用） */
export function clearSectionsCache(slug?: string | null): void {
  const s = slug ?? FALLBACK_USER_ID;
  sectionsCache.delete(s);
}

/** セクションにアイテムを追加（検索ページ用） */
export async function addItemToSection(
  slug: string,
  sectionId: string,
  item: { product: string; brand?: string; image?: string; link?: string; label?: string }
): Promise<boolean> {
  const sections = await getSections(slug);
  if (!sections || sections === "error" || sections.length === 0) return false;
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

let _pendingSave: Promise<void> | null = null;
const _debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const _pendingData = new Map<string, import("@/lib/sections").Section[]>();

function doSave(s: string, sections: import("@/lib/sections").Section[]): Promise<void> {
  const p = db.saveSections(s, sections).then(async () => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: s }),
      });
    } catch { /* ignore */ }
  });
  _pendingSave = p;
  p.finally(() => { if (_pendingSave === p) _pendingSave = null; });
  return p;
}

/** セクション一覧保存（slug ごと）— 800ms デバウンス付き */
export function setSections(
  sections: import("@/lib/sections").Section[],
  slug?: string | null
): void {
  const s = slug ?? FALLBACK_USER_ID;
  if (!useSupabase()) {
    local.setSections(s, sections);
    return;
  }
  _pendingData.set(s, sections);
  sectionsCache.set(s, { data: sections, ts: Date.now() });
  const existing = _debounceTimers.get(s);
  if (existing) clearTimeout(existing);
  _debounceTimers.set(s, setTimeout(() => {
    _debounceTimers.delete(s);
    const data = _pendingData.get(s);
    _pendingData.delete(s);
    if (data) doSave(s, data);
  }, 800));
}

/** デバウンス中のデータがあれば即座にflushして保存 */
export function flushSections(slug?: string | null): Promise<void> {
  const s = slug ?? FALLBACK_USER_ID;
  const timer = _debounceTimers.get(s);
  if (timer) {
    clearTimeout(timer);
    _debounceTimers.delete(s);
  }
  const data = _pendingData.get(s);
  _pendingData.delete(s);
  if (data) return doSave(s, data);
  return _pendingSave ?? Promise.resolve();
}

/** 保存中のセクションデータがあれば完了を待つ */
export function waitForPendingSave(): Promise<void> {
  return _pendingSave ?? Promise.resolve();
}
