import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ codes: [] }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ codes: [] }, { status: 401 });
  }

  const url = new URL(request.url);
  const username = url.searchParams.get("username") ?? "";
  if (!username) {
    return NextResponse.json({ codes: [] });
  }

  const { data, error } = await supabase
    .from("invite_codes")
    .select("id, code, used_by, used_at, created_at")
    .eq("created_by", username)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[invite/my-codes] DB error:", error.message);
    return NextResponse.json({ codes: [] });
  }

  return NextResponse.json({ codes: data ?? [] });
}
