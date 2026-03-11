import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

/** 6桁のランダム数字を生成 */
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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

  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "管理者のみ実行できます" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = String(body?.slug ?? "").trim();
  if (!slug) {
    return NextResponse.json(
      { error: "コスメセットを選択してください" },
      { status: 400 }
    );
  }

  const { data: cosmeSet, error: fetchError } = await supabase
    .from("cosme_sets")
    .select("id")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .maybeSingle();

  if (fetchError || !cosmeSet) {
    return NextResponse.json(
      { error: "指定したコスメセットが見つかりません" },
      { status: 404 }
    );
  }

  const { data: existingCode } = await supabase
    .from("invite_codes")
    .select("id")
    .eq("cosme_set_id", cosmeSet.id)
    .eq("is_claimed", false)
    .maybeSingle();

  if (existingCode) {
    return NextResponse.json(
      { error: "このコスメセットには既に招待コードが発行されています" },
      { status: 400 }
    );
  }

  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    code = generateCode();

    const { data: codeExists } = await supabase
      .from("invite_codes")
      .select("id")
      .eq("claim_code", code)
      .maybeSingle();

    if (!codeExists) {
      const { data, error } = await supabase
        .from("invite_codes")
        .insert({ claim_code: code, cosme_set_id: cosmeSet.id })
        .select("claim_code")
        .single();

      if (error) {
        if (error.code === "23505") continue;
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ claim_code: data.claim_code, slug });
    }
    attempts++;
  }

  return NextResponse.json(
    { error: "コードの生成に失敗しました。しばらく待って再試行してください" },
    { status: 500 }
  );
}
