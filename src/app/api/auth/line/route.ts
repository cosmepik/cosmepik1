import { NextRequest, NextResponse } from "next/server";

function getOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.redirect(
      new URL("/login?error=line_not_configured", request.url),
    );
  }

  const state = crypto.randomUUID();
  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth/line/callback`;

  const lineAuthUrl = new URL(
    "https://access.line.me/oauth2/v2.1/authorize",
  );
  lineAuthUrl.searchParams.set("response_type", "code");
  lineAuthUrl.searchParams.set("client_id", channelId);
  lineAuthUrl.searchParams.set("redirect_uri", redirectUri);
  lineAuthUrl.searchParams.set("state", state);
  lineAuthUrl.searchParams.set("scope", "profile openid email");

  const response = NextResponse.redirect(lineAuthUrl.toString());
  response.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
