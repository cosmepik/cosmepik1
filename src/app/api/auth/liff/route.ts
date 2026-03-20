import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * LIFF 経由のログイン。
 * LINE の AccessToken を受け取り、プロフィールを検証して
 * Supabase のセッションを発行する。
 */
export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();
  if (!accessToken) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  /* LINE プロフィール取得（AccessToken の検証を兼ねる） */
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const lineProfile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } = await profileRes.json();

  const userEmail = `line_${lineProfile.userId}@line.cosmepik`;

  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "server_config_error" }, { status: 500 });
  }

  /* ユーザー作成（既存ならスキップ） */
  const metadata = {
    line_id: lineProfile.userId,
    full_name: lineProfile.displayName,
    avatar_url: lineProfile.pictureUrl ?? "",
    provider: "line",
  };

  await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    email_confirm: true,
    user_metadata: metadata,
  });

  /* マジックリンク token_hash を発行 */
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });

  if (linkError || !linkData?.properties?.hashed_token) {
    return NextResponse.json({ error: "session_failed" }, { status: 500 });
  }

  return NextResponse.json({ token_hash: linkData.properties.hashed_token });
}
