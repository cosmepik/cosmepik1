import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ダッシュボード用統合 API
 * 認証チェック + メイクレシピ + プレミアム状態を 1 リクエストで返す。
 * サーバー→Supabase 間は同一リージョンなので高速。
 */
export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ user: null, sets: [], premium: false });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ user: null, sets: [], premium: false });
    }

    const user = session.user;
    const userId = user.id;
    const admin = createAdminClient();
    const sb = supabase;

    async function fetchSets() {
      const full = await sb
        .from("cosme_sets")
        .select("id, name, slug, mode, item_count")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (!full.error) return full.data ?? [];
      const fallback = await sb
        .from("cosme_sets")
        .select("id, name, slug, mode")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (!fallback.error) return fallback.data ?? [];
      const minimal = await sb
        .from("cosme_sets")
        .select("id, name, slug")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      return minimal.data ?? [];
    }

    const [setsData, premiumResult] = await Promise.all([
      fetchSets(),
      admin
        ? admin
            .from("user_subscriptions")
            .select("stripe_subscription_status")
            .eq("user_id", userId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

    const premium =
      (premiumResult.data as { stripe_subscription_status?: string } | null)
        ?.stripe_subscription_status === "active";

    if (setsData.length === 0) {
      return NextResponse.json({
        user: { id: userId, email: user.email, metadata: user.user_metadata },
        sets: [],
        premium,
      });
    }

    const slugs = setsData.map(
      (row: Record<string, unknown>) => row.slug as string,
    );

    const profilesResult = await sb
      .from("profiles")
      .select("username, display_name, avatar_url, bio, bio_sub, skin_type, personal_color, sns_links, background_image_url, use_preset, theme_id, background_id, font_id, card_design_id, rakuten_affiliate_id, updated_at")
      .in("username", slugs);

    const profileMap = new Map<string, Record<string, unknown>>();
    for (const row of profilesResult.data ?? []) {
      profileMap.set(row.username as string, row as Record<string, unknown>);
    }

    const sets = setsData.map((row: Record<string, unknown>) => {
      const slug = row.slug as string;
      const p = profileMap.get(slug);
      return {
        id: row.id as string,
        name: (row.name as string) ?? "マイコスメ",
        slug,
        itemCount: (row.item_count as number) ?? 0,
        avatarUrl: (p?.avatar_url as string) || undefined,
        displayName: (p?.display_name as string) || undefined,
        mode: (row.mode as string) || undefined,
      };
    });

    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const lineAvatar = (meta?.avatar_url as string) || undefined;
    const lineName = (meta?.full_name as string) || undefined;
    if (lineAvatar && profileMap.size > 0) {
      for (const [slug, p] of profileMap) {
        const hasAvatar = !!(p.avatar_url as string);
        const hasName = !!(p.display_name as string);
        if (!hasAvatar || !hasName) {
          const updates: Record<string, string> = {};
          if (!hasAvatar) updates.avatar_url = lineAvatar;
          if (!hasName && lineName) updates.display_name = lineName;
          sb.from("profiles")
            .update(updates)
            .eq("username", slug)
            .then(() => {}, () => {});
          if (!hasAvatar) p.avatar_url = lineAvatar;
          if (!hasName && lineName) p.display_name = lineName;
        }
      }
    }

    const profiles: Record<string, Record<string, unknown>> = {};
    for (const [slug, p] of profileMap) {
      profiles[slug] = p;
    }

    return NextResponse.json({
      user: { id: userId, email: user.email, metadata: user.user_metadata },
      sets,
      premium,
      profiles,
    });
  } catch (e) {
    console.error("[api/dashboard]", e);
    return NextResponse.json(
      { user: null, sets: [], premium: false },
      { status: 500 },
    );
  }
}
