import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** プロフィール保存後に公開ページのキャッシュを即時無効化する */
export async function POST(request: NextRequest) {
  try {
    const { username } = (await request.json()) as { username?: string };
    if (!username || typeof username !== "string") {
      return NextResponse.json({ ok: false, error: "username required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { data: sets } = await supabase
      .from("cosme_sets")
      .select("slug")
      .eq("user_id", session.user.id);

    const owns = sets?.some((s) => s.slug === username) ?? false;
    if (!owns) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    revalidatePath(`/p/${username}`);
    revalidatePath(`/${username}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[revalidate]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
