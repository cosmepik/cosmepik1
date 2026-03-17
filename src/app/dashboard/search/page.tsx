"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { searchMockCosme } from "@/lib/mock-data";
import { getSections, addItemToSection } from "@/lib/store";
import { CosmeCard } from "@/components/CosmeCard";
import { ProfileIcon } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import type { CosmeItem } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const slug = searchParams.get("slug") ?? "demo";

  const [keyword, setKeyword] = useState("");
  const [sections, setSections] = useState<Awaited<ReturnType<typeof getSections>>>(null);
  const [searchResults, setSearchResults] = useState<CosmeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchDebug, setSearchDebug] = useState<object | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [sectionPicker, setSectionPicker] = useState<CosmeItem | null>(null);

  useEffect(() => {
    getSections(slug).then(setSections);
  }, [slug]);

  useEffect(() => {
    const k = keyword.trim();
    if (!k) {
      setSearchResults([]);
      setSearchError(null);
      setSearchDebug(null);
      setIsSearching(false);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    const isProduction =
      typeof window !== "undefined" &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!isProduction) {
      setSearchResults(searchMockCosme(k));
      setSearchError(null);
      setSearchDebug(null);
      setIsSearching(false);
      setIsPending(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      setSearchDebug(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=20`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        const errMsg = data?.error ?? data?.error_description;

        if (res.ok && items.length > 0) {
          setSearchResults(items);
          setSearchError(null);
          setSearchDebug(null);
        } else if (!res.ok || errMsg) {
          const msg =
            errMsg ??
            (res.status === 403
              ? "楽天APIのドメイン制限のため、許可されたウェブサイトに本番URLを追加してください"
              : `APIエラー (${res.status})`);
          setSearchError(msg);
          setSearchDebug(data?._debug ?? null);
          setSearchResults([]);
        } else if (res.ok && items.length === 0) {
          setSearchError("該当する商品がありません（楽天API）");
          setSearchDebug(data?._debug ?? null);
          setSearchResults([]);
        }
      } catch (e) {
        const msg = e instanceof Error && e.name === "AbortError"
          ? "検索がタイムアウトしました。もう一度お試しください。"
          : (e instanceof Error ? e.message : "楽天APIへの接続に失敗しました");
        setSearchError(msg);
        setSearchDebug(null);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setIsPending(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const addableSections = (sections ?? []).filter((s) =>
    ["routine", "products"].includes(s.type)
  );

  const handleAddItem = useCallback(
    (item: CosmeItem) => {
      setAddError(null);
      if (addableSections.length === 0) {
        setAddError("編集画面でグループを作成してから追加できます。");
        return;
      }
      if (addableSections.length === 1) {
        addItemToSection(slug, addableSections[0].id, {
          product: item.name,
          image: item.imageUrl,
          link: item.rakutenUrl ?? item.amazonUrl,
        })
          .then((ok) => {
            if (ok) {
              router.push(`/dashboard/edit/${slug}`);
            } else {
              setAddError("追加に失敗しました。もう一度お試しください。");
            }
          })
          .catch(() => setAddError("追加に失敗しました。もう一度お試しください。"));
        return;
      }
      setSectionPicker(item);
    },
    [router, slug, addableSections]
  );

  const handlePickSection = useCallback(
    (sectionId: string) => {
      if (!sectionPicker) return;
      setAddError(null);
      addItemToSection(slug, sectionId, {
        product: sectionPicker.name,
        image: sectionPicker.imageUrl,
        link: sectionPicker.rakutenUrl ?? sectionPicker.amazonUrl,
      })
        .then((ok) => {
          if (ok) {
            setSectionPicker(null);
            router.push(`/dashboard/edit/${slug}`);
          } else {
            setAddError("追加に失敗しました。もう一度お試しください。");
          }
        })
        .catch(() => setAddError("追加に失敗しました。もう一度お試しください。"));
    },
    [router, slug, sectionPicker]
  );

  const totalItems = (sections ?? []).reduce((sum, s) => sum + s.items.length, 0);

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href={`/dashboard/edit/${slug}`} className="text-sm font-medium text-green hover:underline">
            ← 編集画面に戻る
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{totalItems} 件</span>
            {user && <ProfileIcon user={user} />}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-medium tracking-wide text-foreground">コスメを検索して追加</h1>
        <p className="mt-1 text-sm text-muted-foreground">「ファンデーション」「SHISEIDO」などで検索</p>

        <div className="mt-6">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="商品名・カテゴリで検索"
            className="w-full rounded-xl border border-input bg-white px-4 py-3 text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        <div className="mt-6 space-y-4">
          {(isSearching || isPending) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
              <span>検索中</span>
            </div>
          )}
          {searchError && (
            <div className="space-y-1">
              <p className="text-sm text-destructive">{searchError}</p>
              {searchDebug && (
                <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
                  {JSON.stringify(searchDebug, null, 2)}
                </pre>
              )}
            </div>
          )}
          {!isSearching && searchResults.length === 0 && keyword.trim() && !searchError && <p className="text-sm text-muted-foreground">該当する商品がありません</p>}
          {!isSearching && searchResults.length === 0 && !keyword.trim() && <p className="text-sm text-muted-foreground">検索窓に文字を入れると候補が表示されます</p>}
          {searchResults.map((item) => (
            <CosmeCard key={item.id} item={item} onAdd={handleAddItem} isInList={false} />
          ))}
        </div>
      </div>

      {addError && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{addError}</span>
          {addError.includes("グループを作成") && (
            <Link
              href={`/dashboard/edit/${slug}`}
              className="font-medium text-green hover:underline"
            >
              編集画面へ →
            </Link>
          )}
        </div>
      )}
      {sectionPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSectionPicker(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl">
            <h3 className="mb-4 text-base font-bold text-card-foreground">
              どのグループに追加しますか？
            </h3>
            <div className="flex flex-col gap-2">
              {addableSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handlePickSection(section.id)}
                  className="flex items-center justify-between rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-accent"
                >
                  <span className="font-medium text-card-foreground">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {section.items.length}件
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSectionPicker(null)}
              className="mt-4 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground">
              キャンセル
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/** ブロック追加：コスメを検索して追加 */
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">読み込み中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
