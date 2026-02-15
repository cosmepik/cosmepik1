"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { searchMockCosme } from "@/lib/mock-data";
import { getMyList, addToList } from "@/lib/local-storage";
import { CosmeCard } from "@/components/CosmeCard";
import { AddCommentModal } from "@/components/AddCommentModal";
import type { CosmeItem, ListedCosmeItem } from "@/types";

export default function InfluencerSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [myList, setMyList] = useState<ListedCosmeItem[]>([]);

  useEffect(() => {
    setMyList(getMyList());
  }, []);
  const [modalItem, setModalItem] = useState<CosmeItem | null>(null);

  const searchResults = useMemo(
    () => (keyword.trim() ? searchMockCosme(keyword) : []),
    [keyword]
  );

  const listIds = useMemo(() => new Set(myList.map((x) => x.id)), [myList]);

  const openModal = useCallback((item: CosmeItem) => {
    setModalItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setModalItem(null);
  }, []);

  const handleAddToList = useCallback(
    (item: CosmeItem, comment: string) => {
      const next = addToList({
        ...item,
        comment: comment || "（コメントなし）",
      });
      setMyList(next);
      setModalItem(null);
    },
    []
  );

  return (
    <main className="min-h-screen bg-cream-100">
      <header className="border-b border-cream-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/influencer/manage"
            className="text-gold-600 hover:text-gold-700 text-sm font-medium"
          >
            ← 管理画面に戻る
          </Link>
          <span className="text-sm text-stone-500">
            リストに {myList.length} 件
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-medium text-stone-800 tracking-wide">
          コスメを検索して追加
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          「ファンデーション」「SHISEIDO」などで検索（ダミーデータで動作）
        </p>

        <div className="mt-6">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="商品名・ブランド・カテゴリで検索"
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 ring-gold"
            autoFocus
          />
        </div>

        <div className="mt-6 space-y-4">
          {searchResults.length === 0 && keyword.trim() && (
            <p className="text-sm text-stone-500">該当する商品がありません</p>
          )}
          {searchResults.length === 0 && !keyword.trim() && (
            <p className="text-sm text-stone-500">
              上記の検索窓に文字を入れると候補が表示されます
            </p>
          )}
          {searchResults.map((item) => (
            <CosmeCard
              key={item.id}
              item={item}
              onAdd={openModal}
              isInList={listIds.has(item.id)}
            />
          ))}
        </div>
      </div>

      <AddCommentModal
        item={modalItem}
        onClose={closeModal}
        onConfirm={handleAddToList}
      />
    </main>
  );
}
