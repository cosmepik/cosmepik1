"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setHasSession(false);
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ type: "error", text: "パスワードが一致しません" });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "パスワードは6文字以上で入力してください" });
      return;
    }

    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase が設定されていません。" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage({ type: "ok", text: "パスワードを更新しました。ログイン画面に移動します..." });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (hasSession === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm text-center">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex justify-center hover:opacity-80">
              <CosmepikLogo className="h-7" height={30} />
            </Link>
          </div>
          <p className="mb-4 text-destructive">リセットリンクの有効期限が切れているか、無効です。</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-3 text-sm font-medium text-white hover:opacity-90 active:scale-[0.98]"
          >
            もう一度リセットメールを送信
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex justify-center hover:opacity-80">
            <CosmepikLogo className="h-7" height={30} />
          </Link>
        </div>
        <h1 className="mb-2 text-center text-lg font-semibold text-foreground">新しいパスワードを設定</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          6文字以上の新しいパスワードを入力してください。
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-card-foreground">新しいパスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              enterKeyHint="next"
              className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground"
              placeholder="6文字以上"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-card-foreground">パスワード確認</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              enterKeyHint="go"
              className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-card-foreground"
              placeholder="もう一度入力"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || message?.type === "ok"}
            className="w-full rounded-lg bg-green py-3 font-medium text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "更新中..." : "パスワードを更新"}
          </button>
        </form>
      </div>
    </main>
  );
}
