"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { searchMockCosme } from "@/lib/mock-data";
import { getSections, addItemToSection } from "@/lib/store";
import { CosmeCard } from "@/components/CosmeCard";
import { AddCommentModal } from "@/components/AddCommentModal";
import { ProfileIcon } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import type { CosmeItem } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const slug = searchParams.get("slug") ?? "demo";

  const [keyword, setKeyword] = useState("");
  const [sections, setSections] = useState<Awaited<ReturnType<typeof getSections>>>(null);
  const [searchResults, setSearchResults] = useState<CosmeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<CosmeItem | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [sectionPicker, setSectionPicker] = useState<{ item: CosmeItem; comment: string } | null>(null);

  useEffect(() => {
    getSections(slug).then(setSections);
  }, [slug]);

  useEffect(() => {
    const k = keyword.trim();
    if (!k) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/rakuten/search?keyword=${encodeURIComponent(k)}&hits=20`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.items)) {
          setSearchResults(data.items);
          setSearchError(null);
        } else if (res.status === 503 || res.status === 403 || res.status >= 500) {
          setSearchResults(searchMockCosme(k));
          setSearchError(res.status === 403 ? "楽天APIのドメイン制限のため、本番環境でお試しください" : null);
        } else if (data.error) {
          setSearchError(data.error);
          setSearchResults([]);
        } else {
          setSearchResults(searchMockCosme(k));
        }
      } catch {
        setSearchResults(searchMockCosme(k));
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const addableSections = (sections ?? []).filter((s) =>
    ["routine", "products"].includes(s.type)
  );
  const openModal = useCallback((item: CosmeItem) => setModalItem(item), []);
  const closeModal = useCallback(() => {
    setModalItem(null);
    setSectionPicker(null);
  }, []);

  const handleAddToList = useCallback(
    (item: CosmeItem, comment: string) => {
      setAddError(null);
      if (addableSections.length === 0) {
        setAddError("編集画面でセクションを作成してから追加できます。");
        setModalItem(null);
        return;
      }
      if (addableSections.length === 1) {
        addItemToSection(slug, addableSections[0].id, {
          product: item.name,
          brand: item.brand,
          image: item.imageUrl,
          link: item.rakutenUrl ?? item.amazonUrl,
          label: comment.trim() || undefined,
        })
          .then((ok) => {
            if (ok) {
              setModalItem(null);
              router.push(`/dashboard/edit/${slug}`);
            } else {
              setAddError("追加に失敗しました。もう一度お試しください。");
            }
          })
          .catch(() => setAddError("追加に失敗しました。もう一度お試しください。"));
        return;
      }
      setModalItem(null);
      setSectionPicker({ item, comment });
    },
    [router, slug, addableSections]
  );

  const handlePickSection = useCallback(
    (sectionId: string) => {
      if (!sectionPicker) return;
      const { item, comment } = sectionPicker;
      setAddError(null);
      addItemToSection(slug, sectionId, {
        product: item.name,
        brand: item.brand,
        image: item.imageUrl,
        link: item.rakutenUrl ?? item.amazonUrl,
        label: comment.trim() || undefined,
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
            placeholder="商品名・ブランド・カテゴリで検索"
            className="w-full rounded-xl border border-input bg-white px-4 py-3 text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        <div className="mt-6 space-y-4">
          {isSearching && <p className="text-sm text-muted-foreground">検索中...</p>}
          {searchError && <p className="text-sm text-destructive">{searchError}</p>}
          {!isSearching && searchResults.length === 0 && keyword.trim() && !searchError && <p className="text-sm text-muted-foreground">該当する商品がありません</p>}
          {!isSearching && searchResults.length === 0 && !keyword.trim() && <p className="text-sm text-muted-foreground">検索窓に文字を入れると候補が表示されます</p>}
          {searchResults.map((item) => (
            <CosmeCard key={item.id} item={item} onAdd={openModal} isInList={false} />
          ))}
        </div>
      </div>

      {addError && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{addError}</span>
          {addError.includes("セクションを作成") && (
            <Link
              href={`/dashboard/edit/${slug}`}
              className="font-medium text-green hover:underline"
            >
              編集画面へ →
            </Link>
          )}
        </div>
      )}
      <AddCommentModal
        item={modalItem}
        onClose={() => {
          setModalItem(null);
          setAddError(null);
        }}
        onConfirm={handleAddToList}
      />
      {sectionPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSectionPicker(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl">
            <h3 className="mb-4 text-base font-bold text-card-foreground">
              どのセクションに追加しますか？
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
