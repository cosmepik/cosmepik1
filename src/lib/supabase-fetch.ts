/**
 * サーバーコンポーネント専用: Supabase REST API を直接 fetch() で叩く。
 * Next.js の fetch キャッシュと統合し、CDN レベルでキャッシュされる。
 */
import type { InfluencerProfile } from "@/types";
import type { Section } from "@/lib/sections";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

interface PublicPageData {
  profile: InfluencerProfile | null;
  sections: Section[];
}

/**
 * プロフィール + セクションを 1 回の RPC 呼び出しで取得。
 * RPC が未作成の場合は自動的に 2 並列 REST フォールバック。
 */
export async function fetchPublicPageData(username: string): Promise<PublicPageData> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { profile: null, sections: [] };
  }

  try {
    const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/get_public_page`;
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_username: username }),
      next: { revalidate: 10 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.profile?.username) {
        return {
          profile: mapProfile(data.profile),
          sections: Array.isArray(data.sections) ? (data.sections as Section[]) : [],
        };
      }
    }
  } catch {
    // RPC fallback below
  }

  const [profile, sections] = await Promise.all([
    fetchProfileRest(username),
    fetchSectionsRest(username),
  ]);
  return { profile, sections };
}

function mapProfile(d: Record<string, unknown>): InfluencerProfile {
  return {
    username: d.username as string,
    displayName: (d.display_name as string) ?? "",
    avatarUrl: (d.avatar_url as string) ?? undefined,
    backgroundImageUrl: (d.background_image_url as string) ?? undefined,
    usePreset: (d.use_preset as boolean) ?? undefined,
    themeId: (d.theme_id as string) ?? undefined,
    backgroundId: (d.background_id as string) ?? undefined,
    fontId: (d.font_id as string) ?? undefined,
    cardDesignId: (d.card_design_id as string) ?? undefined,
    cardColor: (d.card_color as string) ?? undefined,
    textColor: (d.text_color as string) ?? undefined,
    bio: (d.bio as string) ?? undefined,
    bioSub: (d.bio_sub as string) ?? undefined,
    skinType: (d.skin_type as string) ?? undefined,
    personalColor: (d.personal_color as string) ?? undefined,
    snsLinks: d.sns_links as InfluencerProfile["snsLinks"],
    rakutenAffiliateId: (d.rakuten_affiliate_id as string) ?? undefined,
    list: [],
    updatedAt: (d.updated_at as string) ?? new Date().toISOString(),
  };
}

async function fetchProfileRest(username: string): Promise<InfluencerProfile | null> {
  const url = `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/vnd.pgrst.object+json",
      },
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.username ? mapProfile(data) : null;
  } catch {
    return null;
  }
}

async function fetchSectionsRest(username: string): Promise<Section[]> {
  const url = `${SUPABASE_URL}/rest/v1/sections?username=eq.${encodeURIComponent(username)}&select=sections_json`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: 10 },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return [];
    const arr = rows[0]?.sections_json;
    return Array.isArray(arr) ? (arr as Section[]) : [];
  } catch {
    return [];
  }
}
