import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

function generate5DigitCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/** POST: 譲渡コード発行（管理者のみ） */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase に接続できません" }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });

  const { sourceSlug } = (await req.json()) as { sourceSlug?: string };
  if (!sourceSlug) return NextResponse.json({ error: "sourceSlug が必要です" }, { status: 400 });

  const { data: exists } = await admin.from("profiles").select("username").eq("username", sourceSlug).maybeSingle();
  if (!exists) return NextResponse.json({ error: `slug "${sourceSlug}" が見つかりません` }, { status: 404 });

  let code = generate5DigitCode();
  for (let i = 0; i < 10; i++) {
    const { error } = await admin.from("recipe_transfer_codes").insert({
      code,
      source_slug: sourceSlug,
      created_by: user.id,
    });
    if (!error) {
      return NextResponse.json({ code, sourceSlug });
    }
    code = generate5DigitCode();
  }

  return NextResponse.json({ error: "コード生成に失敗しました。再試行してください。" }, { status: 500 });
}

/** GET: 発行済みコード一覧（管理者のみ） */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase に接続できません" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });

  const { data, error } = await admin
    .from("recipe_transfer_codes")
    .select("id, code, source_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}

/** DELETE: コード削除（管理者のみ） */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase に接続できません" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  if (user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id が必要です" }, { status: 400 });

  await admin.from("recipe_transfer_codes").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
