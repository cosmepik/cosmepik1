import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ valid: false, error: "DB接続エラー" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();

  if (!/^\d{5}$/.test(code)) {
    return NextResponse.json({ valid: false });
  }

  const { data, error } = await supabase
    .from("invite_codes")
    .select("id")
    .eq("code", code)
    .is("used_by", null)
    .maybeSingle();

  if (error) {
    console.error("[invite/verify] DB error:", error.message);
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: !!data });
}
