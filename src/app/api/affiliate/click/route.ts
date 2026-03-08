import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** クリックログ記録（分析用） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, itemId, productUrl, usedId } = body as {
      username?: string;
      itemId?: string;
      productUrl?: string;
      usedId?: "user" | "admin";
    };

    if (!username || !usedId || !["user", "admin"].includes(usedId)) {
      return NextResponse.json({ ok: false, error: "Invalid params" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
    }

    const { error } = await supabase.from("click_logs").insert({
      username,
      item_id: itemId ?? null,
      product_url: productUrl ?? null,
      used_id: usedId,
    });

    if (error) {
      console.error("[click_logs] insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[click_logs]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
