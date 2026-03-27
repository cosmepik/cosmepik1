"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { searchMockCosme } from "@/lib/mock-data";
import { getSections, addItemToSection } from "@/lib/store";
import { ProfileIcon } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import type { CosmeItem } from "@/types";

/* ── スケルトンUI ── */

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-sm animate-pulse overflow-hidden">
      <div className="aspect-square w-full bg-muted" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-2.5 w-12 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

/* ── 検索結果カード ── */

function ResultCard({
  item,
  onAdd,
}: {
  item: CosmeItem;
  onAdd: (item: CosmeItem) => void;
}) {
  return (
    <div className="relative flex flex-col rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <div className="relative aspect-square w-full bg-muted">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
        <button
          type="button"
          onClick={() => onAdd(item)}
          aria-label="リストに追加"
          className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="px-2.5 py-2">
        {item.brand && (
          <p className="truncate text-[10px] font-semibold tracking-wide text-primary">
            {item.brand}
          </p>
        )}
        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {item.name}
        </h3>
      </div>
    </div>
  );
}

/* ── メインコンテンツ ── */

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const slug = searchParams.get("slug") ?? "demo";

  const [keyword, setKeyword] = useState("");
  const [sections, setSections] = useState<import("@/lib/sections").Section[] | null>(null);
  const [searchResults, setSearchResults] = useState<CosmeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [sectionPicker, setSectionPicker] = useState<CosmeItem | null>(null);

  useEffect(() => {
    getSections(slug).then((r) => {
      if (r !== "error") setSections(r);
    });
  }, [slug]);

  useEffect(() => {
    const k = keyword.trim();
    if (!k) {
      setSearchResults([]);
      setSearchError(null);
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
      setIsSearching(false);
      setIsPending(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(
          `/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=10`,
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data?.items) ? data.items : [];
        const errMsg = data?.error ?? data?.error_description;

        if (res.ok && items.length > 0) {
          setSearchResults(items);
          setSearchError(null);
        } else if (!res.ok || errMsg) {
          setSearchError(
            errMsg ??
              (res.status === 403
                ? "楽天APIのドメイン制限のため、許可されたウェブサイトに本番URLを追加してください"
                : `APIエラー (${res.status})`),
          );
          setSearchResults([]);
        } else {
          setSearchError("該当する商品がありません");
          setSearchResults([]);
        }
      } catch (e) {
        setSearchError(
          e instanceof Error && e.name === "AbortError"
            ? "検索がタイムアウトしました。もう一度お試しください。"
            : "楽天APIへの接続に失敗しました",
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setIsPending(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const addableSections = (sections ?? []).filter((s) =>
    ["routine", "products"].includes(s.type),
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
          .catch(() =>
            setAddError("追加に失敗しました。もう一度お試しください。"),
          );
        return;
      }
      setSectionPicker(item);
    },
    [router, slug, addableSections],
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
        .catch(() =>
          setAddError("追加に失敗しました。もう一度お試しください。"),
        );
    },
    [router, slug, sectionPicker],
  );

  const totalItems = (sections ?? []).reduce(
    (sum, s) => sum + s.items.length,
    0,
  );
  const showSkeleton = (isSearching || isPending) && searchResults.length === 0;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href={`/dashboard/edit/${slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← 編集に戻る
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {totalItems} 件
            </span>
            {user && <ProfileIcon user={user} />}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-10 pt-6">
        <h1 className="text-lg font-semibold text-foreground">
          コスメを検索して追加
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          「ファンデーション」「SHISEIDO」などで検索
        </p>

        <div className="mt-5">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="商品名・ブランドで検索"
            className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* スケルトンUI */}
          {showSkeleton &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {/* エラー */}
          {searchError && (
            <p className="col-span-2 text-center text-sm text-destructive">
              {searchError}
            </p>
          )}

          {/* 空状態 */}
          {!isSearching &&
            !isPending &&
            searchResults.length === 0 &&
            !searchError && (
              <p className="col-span-2 pt-6 text-center text-sm text-muted-foreground">
                {keyword.trim()
                  ? "該当する商品がありません"
                  : "検索窓に文字を入れると候補が表示されます"}
              </p>
            )}

          {/* 結果 */}
          {searchResults.map((item) => (
            <ResultCard key={item.id} item={item} onAdd={handleAddItem} />
          ))}
        </div>
      </div>

      {/* 追加エラー */}
      {addError && (
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{addError}</span>
            {addError.includes("グループを作成") && (
              <Link
                href={`/dashboard/edit/${slug}`}
                className="ml-2 font-medium text-primary hover:underline"
              >
                編集画面へ →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* セクション選択モーダル */}
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
                  <span className="font-medium text-card-foreground">
                    {section.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {section.items.length}件
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSectionPicker(null)}
              className="mt-4 w-full rounded-xl border border-border py-2 text-sm text-muted-foreground"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          読み込み中...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
