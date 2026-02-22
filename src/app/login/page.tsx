"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient() ?? supabaseFallback;
    if (!supabase) {
      setMessage({
        type: "error",
        text: "Supabase が設定されていません。.env.local（ローカル）または Netlify の環境変数に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
      });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: "ok", text: "確認メールを送信しました。メール内のリンクをクリックしてください。" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/influencer/manage");
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "エラーが発生しました",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream-100">
      <div className="w-full max-w-md card-cream rounded-xl p-6 border border-cream-300">
        <p className="text-center text-gold-700 font-medium tracking-wide mb-6">
          Cosmepik
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-stone-800"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-stone-800"
              placeholder="6文字以上"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.type === "ok" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gold-500 text-white py-3 font-medium hover:bg-gold-600 disabled:opacity-50"
            >
              {loading ? "処理中..." : isSignUp ? "サインアップ" : "サインイン"}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="rounded-lg border border-cream-300 py-3 px-4 text-sm text-stone-600 hover:bg-cream-200"
            >
              {isSignUp ? "サインイン" : "サインアップ"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-gold-600 hover:text-gold-700">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}
