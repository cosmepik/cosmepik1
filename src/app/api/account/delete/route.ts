import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase が設定されていません。" },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "ログインしていません。" },
      { status: 401 }
    );
  }

  const userId = user.id;

  try {
    // 1. このユーザーのコスメセット一覧を取得
    const { data: sets } = await supabase
      .from("cosme_sets")
      .select("slug")
      .eq("user_id", userId);

    const slugs = (sets ?? []).map((r) => r.slug as string);
    // user_id を slug として使っている場合があるため含める
    if (userId && !slugs.includes(userId)) slugs.push(userId);

    // 2. 各 slug の list_items, profile, profile_views を削除
    for (const slug of slugs) {
      await supabase.from("list_items").delete().eq("username", slug);
      await supabase.from("profiles").delete().eq("username", slug);
      await supabase.from("profile_views").delete().eq("username", slug);
    }

    // 3. このユーザーの cosme_sets を削除
    await supabase.from("cosme_sets").delete().eq("user_id", userId);

    // 4. 認証ユーザーを削除（service role がある場合）
    const admin = createAdminClient();
    if (admin) {
      await admin.auth.admin.deleteUser(userId);
    }

    // 5. セッションを破棄（ログアウト）
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[account/delete]", e);
    return NextResponse.json(
      { error: "退会処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
