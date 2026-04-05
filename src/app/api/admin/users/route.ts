import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase に接続できません" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });
  }

  const { data: sets } = await admin
    .from("cosme_sets")
    .select("id, user_id, name, slug, mode, created_at")
    .order("created_at", { ascending: false });

  if (!sets || sets.length === 0) {
    return NextResponse.json({ users: [], summary: { totalViews: 0, totalClicks: 0, totalUsers: 0, activeUsers: 0 } });
  }

  const slugs = sets.map((s) => s.slug as string).filter(Boolean);

  const { data: views } = await admin
    .from("profile_views")
    .select("username, view_count")
    .in("username", slugs);

  const viewMap = new Map<string, number>();
  for (const v of views ?? []) {
    viewMap.set(v.username as string, (v.view_count as number) ?? 0);
  }

  const { data: clicks } = await admin
    .from("click_logs")
    .select("username");

  const clickMap = new Map<string, number>();
  for (const c of clicks ?? []) {
    const u = c.username as string;
    clickMap.set(u, (clickMap.get(u) ?? 0) + 1);
  }

  const users = sets.map((s) => ({
    id: s.id,
    userId: s.user_id,
    name: s.name,
    slug: s.slug,
    mode: s.mode ?? "simple",
    views: viewMap.get(s.slug as string) ?? 0,
    clicks: clickMap.get(s.slug as string) ?? 0,
    createdAt: s.created_at,
  }));

  const totalViews = users.reduce((sum, u) => sum + u.views, 0);
  const totalClicks = users.reduce((sum, u) => sum + u.clicks, 0);

  const uniqueUserIds = new Set(sets.map((s) => s.user_id as string));
  const cumulativeUsers = uniqueUserIds.size;

  const activeAuthIds = new Set<string>();
  let activeUsers = cumulativeUsers;
  try {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      for (const au of authUsers) activeAuthIds.add(au.id);
      hasMore = authUsers.length === 1000;
      page++;
    }
    activeUsers = activeAuthIds.size;
  } catch {
    // auth API unavailable — fall back; show all users
  }

  const activeOnly = activeAuthIds.size > 0
    ? users.filter((u) => activeAuthIds.has(u.userId as string))
    : users;

  return NextResponse.json({
    users: activeOnly,
    summary: {
      totalViews,
      totalClicks,
      totalUsers: cumulativeUsers,
      activeUsers,
    },
  });
}
