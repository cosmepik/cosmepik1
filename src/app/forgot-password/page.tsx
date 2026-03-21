"use client";

import { useState } from "react";
import Link from "next/link";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setError("Supabase が設定されていません。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/login"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="ログインに戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex justify-center hover:opacity-80">
            <CosmepikLogo className="h-7" height={30} />
          </Link>
        </div>
        <h1 className="mb-2 text-center text-lg font-semibold text-foreground">パスワードをリセット</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          登録済みのメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
        </p>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-green">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="mb-2 font-medium text-foreground">メールを送信しました</p>
            <p className="mb-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{email}</span> にパスワード再設定リンクを送信しました。メールを確認してください。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-accent active:scale-[0.98]"
            >
              ← ログイン画面に戻る
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-card-foreground">メールアドレス</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                enterKeyHint="go"
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green py-3 font-medium text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "送信中..." : "リセットリンクを送信"}
            </button>
            <p className="text-center">
              <Link href="/login" className="text-sm text-green hover:underline">ログインに戻る</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
