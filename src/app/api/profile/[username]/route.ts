import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfileLight, fetchSections } from "@/lib/supabase-db";

/**
 * profile + sections を1リクエストで取得（編集画面・公開ページ兼用）
 * fetchProfileLight で list_items を省略し高速化。
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
      fetchProfileLight(username),
      fetchSections(username),
    ]);

    return NextResponse.json(
      { profile, sections: sections ?? [] },
      {
        headers: {
          "Cache-Control": "private, no-cache",
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
