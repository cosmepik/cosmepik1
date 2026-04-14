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
  const all = url.searchParams.get("all") === "1";

  const ADMIN_EMAIL = "cosmepik.team@gmail.com";
  const isAdmin = user.email === ADMIN_EMAIL;

  if (!username && !all) {
    return NextResponse.json({ codes: [] });
  }

  let query = supabase
    .from("user_invite_codes")
    .select("id, code, created_by, used_by, used_at, created_at")
    .order("created_at", { ascending: false });

  if (all && isAdmin) {
    // admin can see all codes
  } else if (username) {
    query = query.eq("created_by", username);
  } else {
    return NextResponse.json({ codes: [] });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[invite/my-codes] DB error:", error.message);
    return NextResponse.json({ codes: [] });
  }

  return NextResponse.json({ codes: data ?? [] });
}
