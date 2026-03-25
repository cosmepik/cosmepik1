import { NextResponse } from "next/server";
import { fetchSections } from "@/lib/supabase-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return new NextResponse(null, { status: 400 });
  }

  const sections = await fetchSections(slug);
  if (!sections) return new NextResponse(null, { status: 404 });

  const recipe = sections.find((s) => s.type === "recipe");
  const bgBase64 = recipe?.backgroundImage;
  if (!bgBase64 || !bgBase64.startsWith("data:")) {
    return new NextResponse(null, { status: 404 });
  }

  const [meta, data] = bgBase64.split(",", 2);
  const mimeMatch = meta.match(/data:(image\/\w+)/);
  const contentType = mimeMatch?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
