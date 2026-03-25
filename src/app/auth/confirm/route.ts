import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * メール確認リンク用サーバーサイドルート。
 * token_hash を使ってサーバー側でOTP検証するため、
 * 登録時と異なるブラウザで開いても正常にログインできる。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "email"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectUrl = new URL(next, request.url);

  if (tokenHash && type) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (!error) {
        return NextResponse.redirect(redirectUrl);
      }
      console.error("[auth/confirm] verifyOtp failed:", error.message);
    }
  }

  const errorUrl = new URL("/auth/callback", request.url);
  errorUrl.searchParams.set(
    "error_description",
    "メール認証に失敗しました。リンクの有効期限が切れているか、既に使用済みの可能性があります。"
  );
  return NextResponse.redirect(errorUrl);
}
