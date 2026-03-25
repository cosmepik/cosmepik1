import type { ListedCosmeItem, InfluencerProfile, CosmeSet } from "@/types";
import type { Section } from "@/lib/sections";

const STORAGE_KEY_LIST = "cosmetree_my_list";
const STORAGE_KEY_SECTIONS_PREFIX = "cosmetree_sections_";
const STORAGE_KEY_PROFILE = "cosmetree_profile";
const STORAGE_KEY_SETS = "cosmetree_cosme_sets";

interface StoredSet {
  id: string;
  name: string;
  slug: string;
  profile: InfluencerProfile;
  list: ListedCosmeItem[];
}

/** クライアントのみで実行するためのヘルパー */
function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/** 旧形式から新形式へマイグレーション */
function migrateToSets(): StoredSet[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  const rawList = ls.getItem(STORAGE_KEY_LIST);
  const rawProfile = ls.getItem(STORAGE_KEY_PROFILE);
  const rawSets = ls.getItem(STORAGE_KEY_SETS);
  if (rawSets) {
    try {
      const parsed = JSON.parse(rawSets) as StoredSet[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  const list: ListedCosmeItem[] = rawList
    ? (() => {
        try {
          const p = JSON.parse(rawList) as ListedCosmeItem[];
          return Array.isArray(p) ? p : [];
        } catch {
          return [];
        }
      })()
    : [];
  const profile: InfluencerProfile = rawProfile
    ? (() => {
        try {
          return JSON.parse(rawProfile) as InfluencerProfile;
        } catch {
          return { username: "demo", displayName: "", list: [], updatedAt: new Date().toISOString() };
        }
      })()
    : { username: "demo", displayName: "", list: [], updatedAt: new Date().toISOString() };
  const slug = profile.username || "demo";
  const sets: StoredSet[] = [{ id: slug, name: "マイコスメ", slug, profile: { ...profile, list }, list }];
  ls.setItem(STORAGE_KEY_SETS, JSON.stringify(sets));
  return sets;
}

function getStoredSets(): StoredSet[] {
  const raw = safeLocalStorage()?.getItem(STORAGE_KEY_SETS);
  if (!raw) return migrateToSets();
  try {
    const parsed = JSON.parse(raw) as StoredSet[];
    return Array.isArray(parsed) ? parsed : migrateToSets();
  } catch {
    return migrateToSets();
  }
}

function saveStoredSets(sets: StoredSet[]): void {
  safeLocalStorage()?.setItem(STORAGE_KEY_SETS, JSON.stringify(sets));
}

/** メイクレシピ一覧取得 */
export function getCosmeSets(): CosmeSet[] {
  const sets = getStoredSets();
  return sets.map((s) => {
    const sections = getSections(s.slug);
    const itemCount = sections
      ? sections.reduce((sum, sec) => sum + sec.items.length, 0)
      : 0;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      itemCount,
      avatarUrl: s.profile?.avatarUrl,
    };
  });
}

/** メイクレシピ作成 */
export function createCosmeSet(name: string, slug: string): CosmeSet {
  const sets = getStoredSets();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newSet: StoredSet = {
    id,
    name: name || "マイコスメ",
    slug: slug || id,
    profile: { username: slug, displayName: "", list: [], updatedAt: new Date().toISOString() },
    list: [],
  };
  sets.push(newSet);
  saveStoredSets(sets);
  return { id, name: newSet.name, slug: newSet.slug, itemCount: 0 };
}

/** slug でセットを取得 */
function getSetBySlug(slug: string): StoredSet | undefined {
  return getStoredSets().find((s) => s.slug === slug);
}

/** slug がローカルに存在するか（addToList のデータソース判定用） */
export function hasSetInLocal(slug: string): boolean {
  return getSetBySlug(slug) !== undefined;
}

/**
 * 自分のリスト（slug 指定）を取得
 */
export function getMyList(slug: string): ListedCosmeItem[] {
  const set = getSetBySlug(slug);
  if (!set) return [];
  return set.list;
}

/**
 * 自分のリストを保存
 */
export function setMyList(slug: string, list: ListedCosmeItem[]): void {
  const sets = getStoredSets();
  const idx = sets.findIndex((s) => s.slug === slug);
  if (idx < 0) return;
  sets[idx] = { ...sets[idx], list };
  saveStoredSets(sets);
}

/**
 * リストに1件追加（愛用コメント・order付き）
 * slug が存在しない場合はセットを自動作成してから追加
 */
export function addToList(slug: string, item: Omit<ListedCosmeItem, "order" | "addedAt">): ListedCosmeItem[] {
  if (!getSetBySlug(slug)) {
    createCosmeSet("マイコスメ", slug);
  }
  const current = getMyList(slug);
  const nextOrder = current.length === 0 ? 0 : Math.max(...current.map((x) => x.order)) + 1;
  const newItem: ListedCosmeItem = {
    ...item,
    order: nextOrder,
    addedAt: new Date().toISOString(),
  };
  const next = [...current, newItem];
  setMyList(slug, next);
  return next;
}

/**
 * プロフィールを取得（slug = username）
 */
export function getProfile(slug: string): InfluencerProfile | null {
  const set = getSetBySlug(slug);
  if (!set) return null;
  return set.profile;
}

/**
 * プロフィールを保存
 */
export function setProfile(slug: string, profile: Partial<InfluencerProfile> & { username: string }): void {
  let sets = getStoredSets();
  let idx = sets.findIndex((s) => s.slug === slug);
  if (idx < 0) {
    createCosmeSet("マイコスメ", slug);
    sets = getStoredSets();
    idx = sets.findIndex((s) => s.slug === slug);
  }
  if (idx < 0) return;
  const existing = sets[idx].profile;
  const merged: InfluencerProfile = {
    username: profile.username ?? existing?.username ?? slug,
    displayName: profile.displayName ?? existing?.displayName ?? "",
    avatarUrl: profile.avatarUrl ?? existing?.avatarUrl,
    backgroundImageUrl: profile.backgroundImageUrl !== undefined ? profile.backgroundImageUrl : existing?.backgroundImageUrl,
    usePreset: profile.usePreset !== undefined ? profile.usePreset : existing?.usePreset,
    themeId: profile.themeId !== undefined ? profile.themeId : existing?.themeId,
    backgroundId: profile.backgroundId !== undefined ? profile.backgroundId : existing?.backgroundId,
    fontId: profile.fontId !== undefined ? profile.fontId : existing?.fontId,
    cardDesignId: profile.cardDesignId !== undefined ? profile.cardDesignId : existing?.cardDesignId,
    cardColor: profile.cardColor !== undefined ? profile.cardColor : existing?.cardColor,
    bio: profile.bio ?? existing?.bio,
    bioSub: profile.bioSub !== undefined ? profile.bioSub : existing?.bioSub,
    skinType: profile.skinType ?? existing?.skinType,
    personalColor: profile.personalColor ?? existing?.personalColor,
    snsLinks: profile.snsLinks !== undefined ? profile.snsLinks : existing?.snsLinks,
    rakutenAffiliateId: profile.rakutenAffiliateId ?? existing?.rakutenAffiliateId,
    list: existing?.list ?? [],
    updatedAt: new Date().toISOString(),
  };
  sets[idx] = { ...sets[idx], profile: merged };
  saveStoredSets(sets);
}

/**
 * リストから id で削除
 */
export function removeFromList(slug: string, id: string): ListedCosmeItem[] {
  const current = getMyList(slug).filter((x) => x.id !== id);
  setMyList(slug, current);
  return current;
}

/**
 * メイクレシピを削除
 */
export function deleteCosmeSet(slug: string): boolean {
  const sets = getStoredSets();
  const filtered = sets.filter((s) => s.slug !== slug);
  if (filtered.length === sets.length) return false;
  saveStoredSets(filtered);
  return true;
}

/**
 * メイクレシピの名前を変更
 */
export function updateCosmeSetName(slug: string, name: string): boolean {
  const sets = getStoredSets();
  const idx = sets.findIndex((s) => s.slug === slug);
  if (idx < 0) return false;
  sets[idx] = { ...sets[idx], name: name.trim() || "マイコスメ" };
  saveStoredSets(sets);
  return true;
}

/**
 * セットの slug（公開URL）を変更
 */
export function renameCosmeSet(oldSlug: string, newSlug: string): boolean {
  const sets = getStoredSets();
  const idx = sets.findIndex((s) => s.slug === oldSlug);
  if (idx < 0) return false;
  const existing = sets.find((s) => s.slug === newSlug);
  if (existing && existing.slug !== oldSlug) return false; // 重複
  const s = sets[idx];
  sets[idx] = {
    ...s,
    slug: newSlug,
    profile: { ...s.profile, username: newSlug },
  };
  saveStoredSets(sets);
  return true;
}

/**
 * セクション一覧を取得（slug ごと）
 */
export function getSections(slug: string): Section[] | null {
  const raw = safeLocalStorage()?.getItem(STORAGE_KEY_SECTIONS_PREFIX + slug);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Section[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * セクション一覧を保存（slug ごと）
 */
export function setSections(slug: string, sections: Section[]): void {
  safeLocalStorage()?.setItem(STORAGE_KEY_SECTIONS_PREFIX + slug, JSON.stringify(sections));
}

/**
 * 並び替え後のリストを保存（order を 0,1,2... で振り直す）
 */
export function reorderList(slug: string, orderedIds: string[]): ListedCosmeItem[] {
  const current = getMyList(slug);
  const byId = new Map(current.map((x) => [x.id, x]));
  const next: ListedCosmeItem[] = orderedIds
    .map((id, index) => {
      const item = byId.get(id);
      if (!item) return null;
      return { ...item, order: index };
    })
    .filter((x): x is ListedCosmeItem => x != null);
  setMyList(slug, next);
  return next;
}
