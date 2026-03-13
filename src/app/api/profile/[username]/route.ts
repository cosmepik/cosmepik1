import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfile, fetchSections } from "@/lib/supabase-db";

/**
 * 公開ページ用：profile + sections を1リクエストで取得（ロード軽量化）
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  if (!username?.trim()) {
    return NextResponse.json({ error: "username を指定してください" }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase が設定されていません" },
      { status: 503 }
    );
  }

  try {
    const [profile, sections] = await Promise.all([
      fetchProfile(username),
      fetchSections(username),
    ]);

    return NextResponse.json(
      { profile, sections: sections ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    console.error("[api/profile]", e);
    return NextResponse.json(
      { error: "取得に失敗しました" },
      { status: 500 }
    );
  }
}
