import { NextResponse } from "next/server";
import { incrementProfileView } from "@/lib/supabase-db";

/**
 * 公開ページ閲覧時に呼ぶ。username（slug）の閲覧数を1増やす。
 * ボット対策はしていない（簡易アナリティクス・モチベーション用）。
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json(
      { error: "username を指定してください" },
      { status: 400 }
    );
  }
  try {
    await incrementProfileView(username);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/view]", e);
    return NextResponse.json(
      { error: "記録に失敗しました" },
      { status: 500 }
    );
  }
}
