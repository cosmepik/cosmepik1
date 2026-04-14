import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";
const MAX_CODES_PER_USER = 3;

function generateCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "DB接続エラー" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = String(body?.username ?? "").trim();
  if (!username) {
    return NextResponse.json({ error: "ユーザー名が必要です" }, { status: 400 });
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  if (!isAdmin) {
    const { count, error: countError } = await supabase
      .from("invite_codes")
      .select("id", { count: "exact", head: true })
      .eq("created_by", username);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }
    if ((count ?? 0) >= MAX_CODES_PER_USER) {
      return NextResponse.json(
        { error: `招待コードは最大${MAX_CODES_PER_USER}つまで発行できます` },
        { status: 400 },
      );
    }
  }

  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from("invite_codes")
      .insert({ code, created_by: username })
      .select("code")
      .single();

    if (!error && data) {
      return NextResponse.json({ code: data.code });
    }
    if (error?.code === "23505") continue;
    return NextResponse.json({ error: error?.message ?? "生成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json(
    { error: "コード生成に失敗しました。再度お試しください" },
    { status: 500 },
  );
}
