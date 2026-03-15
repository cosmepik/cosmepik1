import { supabase } from "@/lib/supabase";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ListedCosmeItem, InfluencerProfile, CosmeSet } from "@/types";
import type { Section } from "@/lib/sections";

const CURRENT_USERNAME = "demo";

/** ブラウザではセッション付きクライアントを返す。null の場合は supabase-js をフォールバック */
function getClient() {
  if (typeof window !== "undefined") {
    const browser = createBrowserClient();
    if (browser) return browser;
    if (supabase) return supabase;
  }
  return supabase;
}

/** リスト取得（username 指定） */
export async function fetchList(username: string): Promise<ListedCosmeItem[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from("list_items")
    .select("*")
    .eq("username", username)
    .order("order", { ascending: true });

  if (error) return [];
  if (!data?.length) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.item_id as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as string,
    imageUrl: row.image_url as string,
    rakutenUrl: row.rakuten_url as string | undefined,
    amazonUrl: row.amazon_url as string | undefined,
    comment: (row.comment as string) ?? "",
    order: (row.order as number) ?? 0,
    addedAt: (row.added_at as string) ?? new Date().toISOString(),
  }));
}

/** プロフィールが無ければ作成（list の FK 用）。既存プロフィールは上書きしない */
async function ensureProfileExists(username: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("profiles").upsert(
    { username, display_name: "", updated_at: new Date().toISOString() },
    { onConflict: "username", ignoreDuplicates: true }
  );
}

/** リストを上書き保存 */
export async function saveList(
  username: string,
  list: ListedCosmeItem[]
): Promise<void> {
  const client = getClient();
  if (!client) return;

  await ensureProfileExists(username);
  await client.from("list_items").delete().eq("username", username);

  if (list.length === 0) return;

  const rows = list.map((item, index) => ({
    username,
    item_id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    image_url: item.imageUrl,
    rakuten_url: item.rakutenUrl ?? null,
    amazon_url: item.amazonUrl ?? null,
    comment: item.comment ?? "",
    order: index,
    added_at: item.addedAt ?? new Date().toISOString(),
  }));

  await client.from("list_items").insert(rows);
}

/** 1件追加 */
export async function addListItem(
  username: string,
  item: Omit<ListedCosmeItem, "order" | "addedAt">
): Promise<ListedCosmeItem[]> {
  const current = await fetchList(username);
  const nextOrder =
    current.length === 0 ? 0 : Math.max(...current.map((x) => x.order)) + 1;
  const newItem: ListedCosmeItem = {
    ...item,
    order: nextOrder,
    addedAt: new Date().toISOString(),
  };
  const next = [...current, newItem];
  await saveList(username, next);
  return next;
}

/** 1件削除 */
export async function removeListItem(
  username: string,
  itemId: string
): Promise<ListedCosmeItem[]> {
  const client = getClient();
  if (!client) return [];

  await client
    .from("list_items")
    .delete()
    .eq("username", username)
    .eq("item_id", itemId);

  return fetchList(username);
}

/** 並び替え */
export async function reorderListItems(
  username: string,
  orderedIds: string[]
): Promise<ListedCosmeItem[]> {
  const current = await fetchList(username);
  const byId = new Map(current.map((x) => [x.id, x]));
  const next: ListedCosmeItem[] = orderedIds
    .map((id, index) => {
      const item = byId.get(id);
      if (!item) return null;
      return { ...item, order: index };
    })
    .filter((x): x is ListedCosmeItem => x != null);
  await saveList(username, next);
  return next;
}

/** プロフィール取得（軽量版: list_items をスキップ。公開ページ用） */
export async function fetchProfileLight(
  username: string
): Promise<InfluencerProfile | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) return null;

  return {
    username: data.username as string,
    displayName: (data.display_name as string) ?? "",
    avatarUrl: data.avatar_url as string | undefined,
    backgroundImageUrl: data.background_image_url as string | undefined,
    usePreset: data.use_preset as boolean | undefined,
    themeId: data.theme_id as string | undefined,
    backgroundId: data.background_id as string | undefined,
    fontId: data.font_id as string | undefined,
    cardDesignId: data.card_design_id as string | undefined,
    bio: data.bio as string | undefined,
    bioSub: data.bio_sub as string | undefined,
    skinType: data.skin_type as string | undefined,
    personalColor: data.personal_color as string | undefined,
    snsLinks: data.sns_links as InfluencerProfile["snsLinks"],
    rakutenAffiliateId: data.rakuten_affiliate_id as string | undefined,
    list: [],
    updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
  };
}

/** プロフィール取得（list_items 含む完全版） */
export async function fetchProfile(
  username: string
): Promise<InfluencerProfile | null> {
  const client = getClient();
  if (!client) return null;

  const [profileResult, list] = await Promise.all([
    client.from("profiles").select("*").eq("username", username).single(),
    fetchList(username),
  ]);

  const { data, error } = profileResult;
  if (error || !data) return null;

  return {
    username: data.username as string,
    displayName: (data.display_name as string) ?? "",
    avatarUrl: data.avatar_url as string | undefined,
    backgroundImageUrl: data.background_image_url as string | undefined,
    usePreset: data.use_preset as boolean | undefined,
    themeId: data.theme_id as string | undefined,
    backgroundId: data.background_id as string | undefined,
    fontId: data.font_id as string | undefined,
    cardDesignId: data.card_design_id as string | undefined,
    bio: data.bio as string | undefined,
    bioSub: data.bio_sub as string | undefined,
    skinType: data.skin_type as string | undefined,
    personalColor: data.personal_color as string | undefined,
    snsLinks: data.sns_links as InfluencerProfile["snsLinks"],
    rakutenAffiliateId: data.rakuten_affiliate_id as string | undefined,
    list,
    updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
  };
}

/** スタイル系フィールドのみ軽量更新（fetch なしで高速化） */
async function updateProfileStyle(
  username: string,
  profile: Partial<InfluencerProfile>
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (profile.backgroundId !== undefined) updates.background_id = profile.backgroundId;
  if (profile.usePreset !== undefined) updates.use_preset = profile.usePreset;
  if (profile.themeId !== undefined) updates.theme_id = profile.themeId;
  if (profile.fontId !== undefined) updates.font_id = profile.fontId;
  if (profile.cardDesignId !== undefined) updates.card_design_id = profile.cardDesignId;

  if (Object.keys(updates).length <= 1) return false;

  const { data, error } = await client
    .from("profiles")
    .update(updates)
    .eq("username", username)
    .select("username");

  return !error && (data?.length ?? 0) > 0;
}

/** プロフィール保存（認証ユーザー紐付け前提。現状は username で一意） */
export async function saveProfile(
  profile: Partial<InfluencerProfile> & { username: string }
): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn("[saveProfile] Supabase client is null. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    return;
  }

  const styleOnly =
    profile.backgroundId !== undefined ||
    profile.usePreset !== undefined ||
    profile.themeId !== undefined ||
    profile.fontId !== undefined ||
    profile.cardDesignId !== undefined;
  const hasOtherFields =
    profile.displayName !== undefined ||
    profile.avatarUrl !== undefined ||
    profile.backgroundImageUrl !== undefined ||
    profile.bio !== undefined ||
    profile.bioSub !== undefined ||
    profile.skinType !== undefined ||
    profile.personalColor !== undefined ||
    profile.snsLinks !== undefined ||
    profile.rakutenAffiliateId !== undefined;

  if (styleOnly && !hasOtherFields) {
    const ok = await updateProfileStyle(profile.username, profile);
    if (ok) return;
  }

  const existing = await fetchProfile(profile.username);
  const rowWithUsePreset = {
    username: profile.username,
    display_name: profile.displayName ?? existing?.displayName ?? "",
    avatar_url: profile.avatarUrl ?? existing?.avatarUrl ?? null,
    background_image_url: profile.backgroundImageUrl ?? existing?.backgroundImageUrl ?? null,
    use_preset: profile.usePreset ?? existing?.usePreset ?? false,
    theme_id: profile.themeId ?? existing?.themeId ?? null,
    background_id: profile.backgroundId ?? existing?.backgroundId ?? null,
    font_id: profile.fontId ?? existing?.fontId ?? null,
    card_design_id: profile.cardDesignId ?? existing?.cardDesignId ?? null,
    bio: profile.bio ?? existing?.bio ?? null,
    bio_sub: profile.bioSub ?? existing?.bioSub ?? null,
    skin_type: profile.skinType ?? existing?.skinType ?? null,
    personal_color: profile.personalColor ?? existing?.personalColor ?? null,
    sns_links: profile.snsLinks ?? existing?.snsLinks ?? null,
    rakuten_affiliate_id: profile.rakutenAffiliateId ?? existing?.rakutenAffiliateId ?? null,
    updated_at: new Date().toISOString(),
  };

  let result = await client
    .from("profiles")
    .upsert(rowWithUsePreset, { onConflict: "username" });

  if (result.error) {
    const msg = result.error.message ?? "";
    if (msg.includes("column") || result.error.code === "42703") {
      const { use_preset: _, theme_id: __, background_id: ___, font_id: ____, card_design_id: _____, ...rowMinimal } = rowWithUsePreset;
      result = await client
        .from("profiles")
        .upsert(rowMinimal, { onConflict: "username" });
    }
  }

  if (result.error) {
    console.error("[saveProfile] Supabase error:", result.error.message, result.error.code);
    throw new Error(`プロフィール保存に失敗しました: ${result.error.message}`);
  }
}

/** セクション一覧取得（username = slug 指定） */
export async function fetchSections(username: string): Promise<Section[] | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("sections")
    .select("sections_json")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  const arr = data.sections_json as unknown;
  if (!Array.isArray(arr)) return null;
  return arr as Section[];
}

/** セクション一覧保存（username = slug 指定） */
export async function saveSections(username: string, sections: Section[]): Promise<void> {
  const client = getClient();
  if (!client) return;

  await ensureProfileExists(username);
  await client.from("sections").upsert(
    {
      username,
      sections_json: sections,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "username" }
  );
}

/** コスメセット一覧取得（user_id 指定）。未登録時は空配列を返す */
export async function fetchCosmeSets(userId: string): Promise<CosmeSet[]> {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client
    .from("cosme_sets")
    .select("id, name, slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return [];

  const slugs = data.map((row: Record<string, unknown>) => row.slug as string);

  const [profilesResult, sectionsResult] = await Promise.all([
    client.from("profiles").select("username, avatar_url").in("username", slugs),
    client.from("sections").select("username, sections_json").in("username", slugs),
  ]);

  const avatarMap = new Map<string, string>();
  for (const row of profilesResult.data ?? []) {
    if (row.avatar_url) avatarMap.set(row.username as string, row.avatar_url as string);
  }

  const itemCountMap = new Map<string, number>();
  for (const row of sectionsResult.data ?? []) {
    const arr = row.sections_json as unknown;
    if (Array.isArray(arr)) {
      const count = (arr as { items?: unknown[] }[]).reduce(
        (sum, sec) => sum + (sec.items?.length ?? 0), 0,
      );
      itemCountMap.set(row.username as string, count);
    }
  }

  return data.map((row: Record<string, unknown>) => {
    const slug = row.slug as string;
    return {
      id: row.id as string,
      name: (row.name as string) ?? "マイコスメ",
      slug,
      itemCount: itemCountMap.get(slug) ?? 0,
      avatarUrl: avatarMap.get(slug),
    };
  });
}

/** コスメセット作成 */
export async function createCosmeSet(
  userId: string,
  name: string,
  slug: string
): Promise<CosmeSet | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client.from("cosme_sets").insert({
    user_id: userId,
    name,
    slug,
  }).select("id, name, slug").single();

  if (error) {
    const msg = `Supabase: ${error.message} (code: ${error.code ?? "—"})`;
    console.warn("[createCosmeSet]", msg);
    throw new Error(msg);
  }
  if (!data) return null;

  await ensureProfileExists(slug);
  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    itemCount: 0,
  };
}

/** コスメセットの名前を更新 */
export async function updateCosmeSetName(
  userId: string,
  slug: string,
  name: string
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  const { error } = await client
    .from("cosme_sets")
    .update({ name: name.trim() || "マイコスメ" })
    .eq("user_id", userId)
    .eq("slug", slug);

  return !error;
}

/** コスメセット削除（cosme_sets, list_items, profiles を削除） */
export async function deleteCosmeSet(userId: string, slug: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  await client.from("list_items").delete().eq("username", slug);
  await client.from("profiles").delete().eq("username", slug);
  const { error } = await client.from("cosme_sets").delete().eq("user_id", userId).eq("slug", slug);

  return !error;
}

/** 公開ページ閲覧数を1増やす（簡易アナリティクス） */
export async function incrementProfileView(username: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  const { data: row } = await client
    .from("profile_views")
    .select("view_count")
    .eq("username", username)
    .single();

  if (row) {
    await client
      .from("profile_views")
      .update({ view_count: (Number(row.view_count) || 0) + 1 })
      .eq("username", username);
  } else {
    await client.from("profile_views").insert({ username, view_count: 1 });
  }
}

/** 複数 username の閲覧数を取得 */
export async function getViewCounts(
  usernames: string[]
): Promise<Record<string, number>> {
  const client = getClient();
  if (!client || usernames.length === 0) return {};

  const { data } = await client
    .from("profile_views")
    .select("username, view_count")
    .in("username", usernames);

  const out: Record<string, number> = {};
  for (const u of usernames) out[u] = 0;
  for (const row of data ?? []) {
    out[row.username as string] = Number((row as { view_count: number }).view_count) || 0;
  }
  return out;
}

export { CURRENT_USERNAME };
