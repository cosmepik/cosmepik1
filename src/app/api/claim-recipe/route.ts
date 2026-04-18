import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/claim-recipe
 * ユーザーが5桁コードを入力してメイクレシピ（レシピモード）を受け取る。
 * ソースの sections をコピーして新しい cosme_set + profile + sections を作成する。
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase に接続できません" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const { code } = (await req.json()) as { code?: string };
  if (!code || !/^\d{5}$/.test(code)) {
    return NextResponse.json({ error: "5桁の数字コードを入力してください" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });

  // 1. コード検索
  const { data: transferCode } = await admin
    .from("recipe_transfer_codes")
    .select("id, source_slug")
    .eq("code", code)
    .maybeSingle();

  if (!transferCode) {
    return NextResponse.json({ error: "無効なコードです" }, { status: 404 });
  }

  const sourceSlug = transferCode.source_slug as string;

  // 2. ソースのセクションを取得（レシピの本体データ）
  const { data: sourceSections } = await admin
    .from("sections")
    .select("sections_json")
    .eq("username", sourceSlug)
    .maybeSingle();

  if (!sourceSections?.sections_json || !Array.isArray(sourceSections.sections_json)) {
    return NextResponse.json({ error: "コピー元のレシピデータが見つかりません" }, { status: 404 });
  }

  const sectionsJson = sourceSections.sections_json as unknown[];
  const hasRecipe = sectionsJson.some((s) => (s as Record<string, unknown>).type === "recipe");
  if (!hasRecipe) {
    return NextResponse.json({ error: "レシピモードのデータが見つかりません" }, { status: 400 });
  }

  // 3. ソースの cosme_set 名を取得
  const { data: sourceSet } = await admin
    .from("cosme_sets")
    .select("name")
    .eq("slug", sourceSlug)
    .maybeSingle();

  const baseName = (sourceSet?.name as string) || "メイクレシピ";
  const timestamp = Date.now().toString(36).slice(-4);
  const newSlug = `${user.id.slice(0, 8)}-${timestamp}`;

  // 4. cosme_set 作成（レシピモード固定）
  const { error: insertError } = await admin.from("cosme_sets").insert({
    user_id: user.id,
    name: baseName,
    slug: newSlug,
    mode: "recipe",
  });
  if (insertError) {
    return NextResponse.json({ error: `レシピの作成に失敗しました: ${insertError.message}` }, { status: 500 });
  }

  // 5. profile 作成（最小限のフィールドのみ。存在しないカラムでエラーにならないよう安全に）
  const { error: profileError } = await admin.from("profiles").upsert({
    username: newSlug,
    display_name: "",
    updated_at: new Date().toISOString(),
  }, { onConflict: "username" });

  if (profileError) {
    console.warn("[claim-recipe] profile upsert warning:", profileError.message);
  }

  // 6. ソースのプロフィールからスタイル情報をコピー（エラーを無視して安全にコピー）
  const { data: sourceProfile } = await admin
    .from("profiles")
    .select("display_name, avatar_url, background_image_url, use_preset, theme_id, background_id, font_id, bio, bio_sub, skin_type, personal_color")
    .eq("username", sourceSlug)
    .maybeSingle();

  if (sourceProfile) {
    const styleUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (sourceProfile.display_name) styleUpdate.display_name = sourceProfile.display_name;
    if (sourceProfile.avatar_url) styleUpdate.avatar_url = sourceProfile.avatar_url;
    if (sourceProfile.background_image_url) styleUpdate.background_image_url = sourceProfile.background_image_url;
    if (sourceProfile.use_preset != null) styleUpdate.use_preset = sourceProfile.use_preset;
    if (sourceProfile.theme_id) styleUpdate.theme_id = sourceProfile.theme_id;
    if (sourceProfile.background_id) styleUpdate.background_id = sourceProfile.background_id;
    if (sourceProfile.font_id) styleUpdate.font_id = sourceProfile.font_id;
    if (sourceProfile.bio) styleUpdate.bio = sourceProfile.bio;
    if (sourceProfile.bio_sub) styleUpdate.bio_sub = sourceProfile.bio_sub;
    if (sourceProfile.skin_type) styleUpdate.skin_type = sourceProfile.skin_type;
    if (sourceProfile.personal_color) styleUpdate.personal_color = sourceProfile.personal_color;

    await admin.from("profiles").update(styleUpdate).eq("username", newSlug);
  }

  // 7. sections コピー（レシピの核心部分）
  const { error: sectionsError } = await admin.from("sections").upsert({
    username: newSlug,
    sections_json: sectionsJson,
    updated_at: new Date().toISOString(),
  }, { onConflict: "username" });

  if (sectionsError) {
    console.error("[claim-recipe] sections upsert failed:", sectionsError.message);
    return NextResponse.json({ error: "レシピデータのコピーに失敗しました" }, { status: 500 });
  }

  // 8. item_count 更新
  const itemCount = sectionsJson.reduce((sum: number, sec: unknown) => {
    const s = sec as Record<string, unknown>;
    if (s.type === "recipe") return sum + ((s.placements as unknown[])?.length ?? 0);
    return sum + ((s.items as unknown[])?.length ?? 0);
  }, 0);

  await admin.from("cosme_sets").update({ item_count: itemCount }).eq("slug", newSlug);

  return NextResponse.json({
    ok: true,
    slug: newSlug,
    name: baseName,
  });
}
