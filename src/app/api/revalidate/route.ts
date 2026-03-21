import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/** プロフィール/セクション保存後に公開ページのキャッシュを即時無効化する */
export async function POST(request: NextRequest) {
  try {
    const { username } = (await request.json()) as { username?: string };
    if (!username || typeof username !== "string" || username.length > 100) {
      return NextResponse.json({ ok: false, error: "username required" }, { status: 400 });
    }

    revalidatePath(`/p/${username}`);
    revalidatePath(`/${username}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[revalidate]", e);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
}
