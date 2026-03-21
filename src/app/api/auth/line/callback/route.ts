import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySignedState } from "../state";

function getOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const lineError = searchParams.get("error");
  const origin = getOrigin(request);

  const loginError = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (lineError || !code) return loginError("line_auth_denied");

  /* ── CSRF state 検証（署名ベース、cookie不要） ── */
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!state || !channelSecret || !verifySignedState(state, channelSecret)) {
    return loginError("line_state_mismatch");
  }

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

  /* ── マジックリンクを生成 ── */
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("LINE auth error:", { createError, linkError });
    return loginError("session_failed");
  }

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

  /* ── サーバー側で OTP 検証 → セッション cookie をセットして直接 /dashboard へ ── */
  const tokenHash = linkData.properties.hashed_token;
  const dashboardUrl = `${origin}/dashboard`;
  const response = NextResponse.redirect(dashboardUrl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return loginError("server_config_error");

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (otpError) {
    console.error("LINE OTP verify error:", otpError.message);
    return loginError("session_failed");
  }

  return response;
}
