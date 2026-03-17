import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

  const body = await request.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();

  const { data: result, error } = await supabase.rpc("claim_invite_code", {
    p_code: code,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(result) ? result[0] : result;
  if (!row?.ok) {
    return NextResponse.json(
      { error: row?.err_msg ?? "このコードは有効期限切れか、既に使用されています" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, slug: row.slug });
}
