"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/** 新規登録：UIBASE 完全準拠 */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase が設定されていません。" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: callbackUrl ? { emailRedirectTo: callbackUrl } : undefined,
      });
      if (error) throw error;
      setMessage({ type: "ok", text: "確認メールを送信しました。メール内のリンクをクリックしてください。" });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "エラーが発生しました",
      });
    } finally {
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
        <h1 className="mb-6 text-center text-lg font-semibold text-foreground">新規登録</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-card-foreground">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-card-foreground">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground"
              placeholder="6文字以上"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "処理中..." : "登録する"}
          </button>
          <button
            type="button"
            onClick={handleTryDemo}
            disabled={loading}
            className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-accent disabled:opacity-50"
          >
            とりあえずつかってみる
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm text-green hover:underline">
            すでにアカウントをお持ちの方はログイン
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}
