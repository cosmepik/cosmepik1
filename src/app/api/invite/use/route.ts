import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    console.error("[invite/use] Supabase not configured");
    return NextResponse.json({ success: false });
  }

  const body = await request.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();
  const username = String(body?.username ?? "").trim();

  if (!code || !username) {
    console.error("[invite/use] Missing code or username");
    return NextResponse.json({ success: false });
  }

  const { data, error } = await supabase
    .from("user_invite_codes")
    .update({ used_by: username, used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_by", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[invite/use] DB error:", error.message);
    return NextResponse.json({ success: false });
  }

  if (!data) {
    console.warn("[invite/use] Code already used or not found:", code);
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({ success: true });
}
