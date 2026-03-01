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
