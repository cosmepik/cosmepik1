"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createCosmeSet, setProfile } from "@/lib/store";
import { Sparkles } from "lucide-react";
import type { CosmeSetMode } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWarning, setSlugWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<CosmeSetMode>("simple");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUserId(data.user.id);
        if (data.sets && data.sets.length > 0) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const hasJapaneseChars = (s: string) =>
    /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/.test(s);

  const handleSlugChange = useCallback((value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9\-_]/g, "");
    if (hasJapaneseChars(value)) {
      setSlug(value);
      setSlugWarning("半角英数で入力してください");
    } else {
      setSlug(filtered);
      setSlugWarning(value !== filtered ? "半角英数で入力してください" : null);
    }
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value;
      const filtered = value.replace(/[^a-zA-Z0-9\-_]/g, "");
      setSlug(filtered);
      setSlugWarning(
        value !== filtered ? "半角英数で入力してください" : null,
      );
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = displayName.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    if (!name) {
      setError("名前を入力してください");
      return;
    }
    if (!normalizedSlug) {
      setError("URLを入力してください");
      return;
    }
    if (!/^[a-z0-9\-_]+$/.test(normalizedSlug)) {
      setError("URLは半角英数・ハイフン・アンダースコアのみ使えます");
      return;
    }

    setSubmitting(true);
    try {
      const newSet = await createCosmeSet(userId, name, normalizedSlug, mode);
      if (!newSet) {
        setError("作成に失敗しました。もう一度お試しください。");
        setSubmitting(false);
        return;
      }

      await setProfile({
        username: normalizedSlug,
        displayName: name,
        updatedAt: new Date().toISOString(),
      });

      sessionStorage.setItem("cosmepik-show-welcome", "1");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "作成に失敗しました";
      if (/duplicate|already|既に|23505/.test(msg)) {
        setError("このURLは既に使われています。別のURLを試してください。");
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex justify-center hover:opacity-80">
            <CosmepikLogo className="h-7" height={30} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-lg">
          <div className="relative overflow-hidden bg-primary/5 px-6 pb-5 pt-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">
                ようこそ！はじめに設定しよう
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                あなたの名前と、ページのURLを決めてね
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 pt-5">
            {/* Mode Selection */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">表示モード</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("simple")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${mode === "simple" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={`h-7 w-7 ${mode === "simple" ? "text-primary" : "text-muted-foreground"}`}>
                    <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
                  </svg>
                  <span className={`text-xs font-medium ${mode === "simple" ? "text-primary" : "text-muted-foreground"}`}>シンプル</span>
                  <span className="text-[10px] text-muted-foreground">コスメをリスト表示</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("recipe")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${mode === "recipe" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={`h-7 w-7 ${mode === "recipe" ? "text-primary" : "text-muted-foreground"}`}>
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className={`text-xs font-medium ${mode === "recipe" ? "text-primary" : "text-muted-foreground"}`}>メイクレシピ</span>
                  <span className="text-[10px] text-muted-foreground">顔写真にコスメ配置</span>
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="display-name"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                あなたの名前
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                コスメページに表示される名前です
              </p>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="あなたの名前を入力"
                className="w-full rounded-xl border border-input bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                コスメページのURLを決めましょう
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                半角英数で入力してね（これがあなたのページのアドレスになるよ）
              </p>
              <div className="flex overflow-hidden rounded-xl border-2 border-input bg-white transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center bg-muted/50 pl-4 pr-2 text-sm font-medium text-muted-foreground shrink-0 border-r border-input">
                  cosmepik.me/p/
                </span>
                <input
                  id="slug"
                  type="text"
                  lang="en"
                  autoComplete="off"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder=""
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-3 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              {slugWarning && (
                <p className="mt-1.5 text-sm text-amber-600">{slugWarning}</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2 hover:opacity-80">利用規約</a>を確認し、同意します
              </span>
            </label>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !agreed}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "作成中..." : "はじめる"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
