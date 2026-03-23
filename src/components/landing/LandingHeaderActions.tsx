"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

/** トップページヘッダーのアクションボタン（ログイン状態で切り替え） */
export function LandingHeaderActions() {
  const { user } = useUser();

  const handleSignOut = async () => {
    const supabase = createClient() ?? supabaseFallback;
    if (supabase) {
      await supabase.auth.signOut();
      document.cookie = "cosmepik_demo=; path=/; max-age=0";
      window.location.href = "/";
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/dashboard"
          className="text-xs md:text-sm tracking-[0.1em] px-3 py-1.5 md:px-4 md:py-2 hover:opacity-80 transition-opacity"
          style={{ color: "#0d4f4a" }}
        >
          マイページ
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "#ffffff", color: "#0d4f4a", boxShadow: "0 2px 12px rgba(13,79,74,0.2)" }}
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Link
        href="/login"
        className="text-xs md:text-sm tracking-[0.1em] px-3 py-1.5 md:px-4 md:py-2 hover:opacity-80 transition-opacity"
        style={{ color: "#0d4f4a" }}
      >
        ログイン
      </Link>
      <Link
        href="/register"
        className="rounded-full px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium transition-opacity hover:opacity-90"
        style={{ background: "#ffffff", color: "#0d4f4a", boxShadow: "0 2px 12px rgba(13,79,74,0.2)" }}
      >
        新規登録
      </Link>
    </div>
  );
}
