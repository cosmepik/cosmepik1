import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

/** 管理者のコスメセットに紐づく招待コード一覧を取得 */
export async function GET(request: NextRequest) {
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

  const { data: cosmeSets } = await supabase
    .from("cosme_sets")
    .select("id, slug")
    .eq("user_id", user.id);

  if (!cosmeSets?.length) {
    return NextResponse.json({ codes: [] });
  }

  const cosmeSetIds = cosmeSets.map((s) => s.id);
  const slugById = new Map(cosmeSets.map((s) => [s.id, s.slug]));

  const { data: inviteCodes } = await supabase
    .from("invite_codes")
    .select("cosme_set_id, claim_code, is_claimed")
    .in("cosme_set_id", cosmeSetIds);

  const codes = (inviteCodes ?? [])
    .filter((ic) => ic.cosme_set_id)
    .map((ic) => ({
      slug: slugById.get(ic.cosme_set_id),
      claim_code: ic.claim_code,
      is_claimed: ic.is_claimed,
    }))
    .filter((c) => c.slug);

  return NextResponse.json({ codes });
}
