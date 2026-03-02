import { createClient } from "@/lib/supabase/server";
import { getViewCounts } from "@/lib/supabase-db";
import { NextResponse } from "next/server";

/**
 * ログイン中のユーザーが持つ公開ページ（slug）ごとの閲覧数を返す。
 */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase が設定されていません" },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "ログインしていません" },
      { status: 401 }
    );
  }

  const userId = user.id;

  const { data: sets } = await supabase
    .from("cosme_sets")
    .select("slug")
    .eq("user_id", userId);

  const slugs = (sets ?? []).map((r) => r.slug as string);
  if (slugs.length === 0) {
    return NextResponse.json({ total: 0, bySlug: {} });
  }

  const bySlug = await getViewCounts(slugs);
  const total = Object.values(bySlug).reduce((a, b) => a + b, 0);

  return NextResponse.json({ total, bySlug });
}
