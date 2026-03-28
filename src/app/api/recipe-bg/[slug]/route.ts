import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return new NextResponse(null, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new NextResponse(null, { status: 503 });
  }

  const url = `${SUPABASE_URL}/rest/v1/sections?username=eq.${encodeURIComponent(slug)}&select=sections_json`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return new NextResponse(null, { status: 502 });

  const rows = await res.json();
  const sections = Array.isArray(rows) && rows[0]?.sections_json;
  if (!Array.isArray(sections)) return new NextResponse(null, { status: 404 });

  const recipe = sections.find((s: { type?: string }) => s.type === "recipe");
  const bgValue = recipe?.backgroundImage as string | undefined;
  if (!bgValue) {
    return new NextResponse(null, { status: 404 });
  }

  if (bgValue.startsWith("http://") || bgValue.startsWith("https://")) {
    return NextResponse.redirect(bgValue, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "CDN-Cache-Control": "public, max-age=604800",
      },
    });
  }

  if (!bgValue.startsWith("data:")) {
    return new NextResponse(null, { status: 404 });
  }

  const [meta, data] = bgValue.split(",", 2);
  const mimeMatch = meta.match(/data:(image\/\w+)/);
  const contentType = mimeMatch?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "CDN-Cache-Control": "public, max-age=604800",
    },
  });
}
