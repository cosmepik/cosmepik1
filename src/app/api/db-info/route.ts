import { NextResponse } from "next/server";

/** 接続先DBの project ID を返す（デバッグ用・機密情報なし） */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url) {
    return NextResponse.json({ storage: "localStorage", projectId: null });
  }
  try {
    const host = new URL(url).hostname;
    const projectId = host.replace(/\.supabase\.co$/, "") || null;
    return NextResponse.json({
      storage: "supabase",
      projectId,
    });
  } catch {
    return NextResponse.json({ storage: "supabase", projectId: null });
  }
}
