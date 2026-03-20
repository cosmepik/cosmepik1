import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * LINE OAuth コールバック。
 * 認証コードを LINE トークンに交換し、Supabase にユーザーを作成/取得して
 * マジックリンクでセッションを確立する。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const lineError = searchParams.get("error");
  const origin = request.nextUrl.origin;

  const loginError = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (lineError || !code) return loginError("line_auth_denied");

  /* ── CSRF state 検証 ── */
  const cookieStore = await cookies();
  const storedState = cookieStore.get("line_oauth_state")?.value;
  cookieStore.delete("line_oauth_state");
  if (!storedState || storedState !== state) return loginError("line_state_mismatch");

  /* ── LINE トークン取得 ── */
  const redirectUri = `${origin}/api/auth/line/callback`;
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_CHANNEL_ID!,
      client_secret: process.env.LINE_CHANNEL_SECRET!,
    }),
  });

  if (!tokenRes.ok) return loginError("line_token_failed");
  const tokenData = await tokenRes.json();

  /* ── LINE プロフィール取得 ── */
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileRes.ok) return loginError("line_profile_failed");

  const lineProfile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } = await profileRes.json();

  /* ── ID トークンからメールアドレスを取得（あれば） ── */
  let email: string | null = null;
  if (tokenData.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(tokenData.id_token.split(".")[1], "base64").toString(),
      );
      email = payload.email || null;
    } catch {
      /* ignore decode error */
    }
  }

  const userEmail = email || `line_${lineProfile.userId}@line.cosmepik`;

  /* ── Supabase admin client ── */
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) return loginError("server_config_error");

  /* ── ユーザー作成（既存ならスキップ） ── */
  const metadata = {
    line_id: lineProfile.userId,
    full_name: lineProfile.displayName,
    avatar_url: lineProfile.pictureUrl ?? "",
    provider: "line",
  };

  const { error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: metadata,
    });

  /* ── マジックリンクを生成（token_hash で自前リダイレクト） ── */
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("LINE auth error:", { createError, linkError });
    return loginError("session_failed");
  }

  // 既存ユーザーの場合、LINE メタデータを追記
  if (createError && linkData.user) {
    const existing = linkData.user.user_metadata ?? {};
    if (!existing.line_id) {
      await supabaseAdmin.auth.admin
        .updateUserById(linkData.user.id, {
          user_metadata: { ...existing, ...metadata },
        })
        .catch(() => {});
    }
  }

  // /auth/callback に token_hash を渡してリダイレクト（verifyOtp でセッション確立）
  const tokenHash = linkData.properties.hashed_token;
  const callbackUrl = new URL(`${origin}/auth/callback`);
  callbackUrl.searchParams.set("token_hash", tokenHash);
  callbackUrl.searchParams.set("type", "magiclink");
  callbackUrl.searchParams.set("next", "/dashboard");
  return NextResponse.redirect(callbackUrl.toString());
}
