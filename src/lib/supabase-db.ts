import { supabase } from "@/lib/supabase";
import type { ListedCosmeItem, InfluencerProfile } from "@/types";

const CURRENT_USERNAME = "demo";

function getClient() {
  if (!supabase) return null;
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

/** プロフィールが無ければ作成（list の FK 用） */
async function ensureProfileExists(username: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.from("profiles").upsert(
    { username, display_name: "", updated_at: new Date().toISOString() },
    { onConflict: "username" }
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

/** プロフィール取得 */
export async function fetchProfile(
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

  const list = await fetchList(username);
  return {
    username: data.username as string,
    displayName: (data.display_name as string) ?? "",
    avatarUrl: data.avatar_url as string | undefined,
    bio: data.bio as string | undefined,
    skinType: data.skin_type as string | undefined,
    personalColor: data.personal_color as string | undefined,
    list,
    updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
  };
}

/** プロフィール保存 */
export async function saveProfile(
  profile: Partial<InfluencerProfile> & { username: string }
): Promise<void> {
  const client = getClient();
  if (!client) return;

  const existing = await fetchProfile(profile.username);

  const row = {
    username: profile.username,
    display_name: profile.displayName ?? existing?.displayName ?? "",
    avatar_url: profile.avatarUrl ?? existing?.avatarUrl ?? null,
    bio: profile.bio ?? existing?.bio ?? null,
    skin_type: profile.skinType ?? existing?.skinType ?? null,
    personal_color: profile.personalColor ?? existing?.personalColor ?? null,
    updated_at: new Date().toISOString(),
  };

  await client.from("profiles").upsert(row, {
    onConflict: "username",
  });
}

export { CURRENT_USERNAME };
