import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * LINE OAuth 認証を開始する。
 * CSRF 対策用の state をクッキーに保存し、LINE の認証画面へリダイレクトする。
 */
export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.redirect(
      new URL("/login?error=line_not_configured", request.url),
    );
  }

  const state = crypto.randomUUID();
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/line/callback`;

  const cookieStore = await cookies();
  cookieStore.set("line_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const lineAuthUrl = new URL(
    "https://access.line.me/oauth2/v2.1/authorize",
  );
  lineAuthUrl.searchParams.set("response_type", "code");
  lineAuthUrl.searchParams.set("client_id", channelId);
  lineAuthUrl.searchParams.set("redirect_uri", redirectUri);
  lineAuthUrl.searchParams.set("state", state);
  lineAuthUrl.searchParams.set("scope", "profile openid email");

  return NextResponse.redirect(lineAuthUrl.toString());
}
