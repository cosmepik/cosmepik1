"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("ログイン処理中...");

  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/dashboard";

    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setStatus("error");
      setMessage("認証の設定に問題があります");
      return;
    }

    let sub: { unsubscribe: () => void } | null = null;

    const run = async () => {
      // Supabase がエラー付きでリダイレクトしてきた場合
      const authError = searchParams.get("error_description") || searchParams.get("error");
      if (authError) {
        setStatus("error");
        const desc = decodeURIComponent(authError.replace(/\+/g, " "));
        if (desc.includes("expired")) {
          setMessage("メールリンクの有効期限が切れています。もう一度登録またはログインしてください。");
        } else {
          setMessage(desc || "認証に失敗しました");
        }
        return;
      }

      // LINE ログイン: token_hash を手動で検証
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
        });
        if (!error) {
          router.replace(next);
          return;
        }
        setStatus("error");
        setMessage(error.message || "ログインに失敗しました");
        return;
      }

      // Google / X / メール認証: createBrowserClient の detectSessionInUrl が
      // 自動的にコード交換するので、セッション確立を待つだけでOK
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          subscription.unsubscribe();
          router.replace(next);
        }
      });
      sub = subscription;

      setTimeout(() => {
        subscription.unsubscribe();
        setStatus("error");
        setMessage("ログインに失敗しました。もう一度お試しください。");
      }, 15000);
    };

    run();

    return () => { sub?.unsubscribe(); };
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex justify-center hover:opacity-80">
            <CosmepikLogo className="h-7" height={30} />
          </Link>
        </div>
        {status === "loading" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="mb-6 text-foreground">{message}</p>
          </>
        )}
        {status === "error" && (
          <p className="mb-6 text-destructive">{message}</p>
        )}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          ← ログイン画面に戻る
        </Link>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm text-center">
            <div className="mb-6 flex justify-center">
              <Link href="/" className="flex justify-center hover:opacity-80">
                <CosmepikLogo className="h-7" height={30} />
              </Link>
            </div>
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="mb-6 text-foreground">ログイン処理中...</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              ← ログイン画面に戻る
            </Link>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
