"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/** ログイン：UIBASE 完全準拠 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const hint = !hasUrl && !hasKey ? "両方の環境変数が読み込まれていません。" : !hasUrl ? "NEXT_PUBLIC_SUPABASE_URL が未設定です。" : "NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。";
      setMessage({ type: "error", text: `Supabase が設定されていません。${hint}` });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "エラーが発生しました" });
    } finally {
      setLoading(false);
    }
  };

  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  const handleOAuth = async (provider: "google" | "twitter") => {
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase が設定されていません。" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const labels = { google: "Google", twitter: "X" };
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : `${labels[provider]}ログインに失敗しました`,
      });
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    document.cookie = "cosmepik_demo=1; path=/; max-age=86400";
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:opacity-80">
            cosmepik
          </Link>
        </div>
        <h1 className="mb-6 text-center text-lg font-semibold text-foreground">ログイン</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-card-foreground">メールアドレス</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-card-foreground">パスワード</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground" placeholder="6文字以上" />
          </div>
          {message && <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>{message.text}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-green py-3 font-medium text-white hover:opacity-90 disabled:opacity-50">
            {loading ? "処理中..." : "ログイン"}
          </button>
          <div className="relative flex items-center py-2">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </span>
            <span className="relative px-2 text-xs text-muted-foreground bg-white">または</span>
          </div>
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-white py-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Googleでログイン
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("twitter")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-white py-3 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでログイン
          </button>
          <button type="button" onClick={handleTryDemo} disabled={loading} className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-accent disabled:opacity-50">
            とりあえずつかってみる
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/register" className="text-sm text-green hover:underline">新規登録はこちら</Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
