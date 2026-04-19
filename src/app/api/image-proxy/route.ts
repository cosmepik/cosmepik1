import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "thumbnail.image.rakuten.co.jp",
  "shop.r10s.jp",
  "image.rakuten.co.jp",
  "r.r10s.jp",
  "hbb.afl.rakuten.co.jp",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.some((host) => parsed.hostname.endsWith(host))) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: { "user-agent": "cosmetree-image-proxy/1.0" },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: 502 },
      );
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, immutable",
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    console.error("[image-proxy]", err);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
