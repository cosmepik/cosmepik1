import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "crypto";

function getOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}

export function createSignedState(secret: string): string {
  const ts = Date.now().toString();
  const nonce = randomUUID();
  const data = `${ts}:${nonce}`;
  const sig = createHmac("sha256", secret).update(data).digest("hex").slice(0, 16);
  return `${data}:${sig}`;
}

export function verifySignedState(state: string, secret: string): boolean {
  const parts = state.split(":");
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${ts}:${nonce}`).digest("hex").slice(0, 16);
  if (sig !== expected) return false;
  const age = Date.now() - parseInt(ts, 10);
  return age >= 0 && age < 600_000;
}

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelId || !channelSecret) {
    return NextResponse.redirect(
      new URL("/login?error=line_not_configured", request.url),
    );
  }

  const state = createSignedState(channelSecret);
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

  return NextResponse.redirect(lineAuthUrl.toString());
}
