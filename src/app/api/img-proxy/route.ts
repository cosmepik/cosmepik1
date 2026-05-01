import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "thumbnail.image.rakuten.co.jp",
  "shop.r10s.jp",
  "image.rakuten.co.jp",
  "r.r10s.jp",
  "hbb.afl.rakuten.co.jp",
];

/**
 * 楽天等のクロスオリジン画像を取得する CORS プロキシ。
 *
 * 旧パス `/api/image-proxy` は Netlify Edge が `?url=` をキャッシュキー
 * に含めず、最初にキャッシュされた画像が後続の別 URL 要求にも返って
 * しまうバグを誘発していた。新パスに切り替えて古いキャッシュ群を捨て、
 * 同時に `Netlify-Vary: query=url` を返してこれ以降は URL ごとに
 * 別エントリとしてキャッシュされるようにする。
 */
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
      headers: { "user-agent": "cosmetree-image-proxy/2.0" },
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
        // Netlify Edge / 標準 CDN いずれにも `?url=` をキャッシュキー
        // へ含めさせる。Netlify-Vary は Netlify 独自の拡張、Vary は
        // 標準ヘッダ（互換性目的で両方入れる）。
        "cache-control": "public, max-age=86400, immutable",
        "netlify-vary": "query=url",
        "vary": "url",
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    console.error("[img-proxy]", err);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
