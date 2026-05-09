import { NextRequest, NextResponse } from "next/server";

const RAKUTEN_HOSTS = [
  "thumbnail.image.rakuten.co.jp",
  "shop.r10s.jp",
  "image.rakuten.co.jp",
  "r.r10s.jp",
  "hbb.afl.rakuten.co.jp",
];

/** Supabase Storage 公開オブジェクトのみ許可（メイクレシピ背景の同一オリジン化に使う） */
function isAllowedSupabasePublicStorage(parsed: URL): boolean {
  if (parsed.protocol !== "https:") return false;
  if (!parsed.hostname.endsWith(".supabase.co")) return false;
  return parsed.pathname.includes("/storage/v1/object/public/");
}

function isAllowedRakutenHost(hostname: string): boolean {
  return RAKUTEN_HOSTS.some((host) => hostname.endsWith(host));
}

/**
 * クロスオリジン画像を取得する CORS プロキシ（楽天サムネ・Supabase 公開Storage）。
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

  const allowed =
    isAllowedRakutenHost(parsed.hostname) || isAllowedSupabasePublicStorage(parsed);
  if (!allowed) {
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
