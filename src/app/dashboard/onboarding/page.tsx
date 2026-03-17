"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { createCosmeSet, setProfile } from "@/lib/store";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWarning, setSlugWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
      const newSet = await createCosmeSet(userId, name, normalizedSlug);
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
                placeholder="例：たい、mina"
                className="w-full rounded-xl border border-input bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                あなた専用のURL
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                半角英数で入力してね（これがあなたのページのアドレスになるよ）
              </p>
              <div className="flex overflow-hidden rounded-xl border-2 border-input bg-white transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="flex items-center pl-4 text-sm font-medium text-muted-foreground shrink-0">
                  {typeof window !== "undefined" && window.location?.origin
                    ? `${new URL(window.location.origin).host}/p/`
                    : "cosmepik.com/p/"}
                </span>
                <input
                  id="slug"
                  type="text"
                  lang="en"
                  autoComplete="off"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder="your-id"
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-1 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              {slugWarning && (
                <p className="mt-1.5 text-sm text-amber-600">{slugWarning}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
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
