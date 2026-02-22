"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  getMyList,
  setMyList,
  getProfile,
  setProfile,
  removeFromList,
  reorderList,
} from "@/lib/store";
import type { ListedCosmeItem } from "@/types";

const SKIN_TYPE_OPTIONS = [
  { value: "", label: "選択する" },
  { value: "乾燥肌", label: "乾燥肌" },
  { value: "混合肌", label: "混合肌" },
  { value: "脂性肌", label: "脂性肌" },
  { value: "普通肌", label: "普通肌" },
  { value: "敏感肌", label: "敏感肌" },
];

const PERSONAL_COLOR_OPTIONS = [
  { value: "", label: "選択する" },
  { value: "イエベ", label: "イエベ（イエローベース）" },
  { value: "ブルベ", label: "ブルベ（ブルーベース）" },
  { value: "スプリング", label: "スプリング" },
  { value: "サマー", label: "サマー" },
  { value: "オータム", label: "オータム" },
  { value: "ウィンター", label: "ウィンター" },
];

export default function InfluencerManagePage() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [list, setList] = useState<ListedCosmeItem[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skinType, setSkinType] = useState("");
  const [personalColor, setPersonalColor] = useState("");
  const initialLoadDone = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    getMyList(userId).then(setList);
  }, [userId]);

  const loadProfile = useCallback(() => {
    getProfile(userId).then((p) => {
      setDisplayName(p?.displayName ?? "");
      setAvatarUrl(p?.avatarUrl ?? "");
      setSkinType(p?.skinType ?? "");
      setPersonalColor(p?.personalColor ?? "");
    });
  }, [userId]);

  useEffect(() => {
    if (userId == null) return;
    load();
    loadProfile();
    const t = setTimeout(() => {
      initialLoadDone.current = true;
    }, 500);
    return () => clearTimeout(t);
  }, [userId, load, loadProfile]);

  useEffect(() => {
    if (!initialLoadDone.current || userId == null) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await setProfile({
        username: userId,
        displayName,
        avatarUrl: avatarUrl || undefined,
        skinType: skinType || undefined,
        personalColor: personalColor || undefined,
        updatedAt: new Date().toISOString(),
      });
    }, 600);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [userId, displayName, avatarUrl, skinType, personalColor]);

  const handleRemove = useCallback((id: string) => {
    if (confirm("この商品をリストから削除しますか？")) {
      removeFromList(id, userId).then(setList);
    }
  }, [userId]);

  const moveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const ids = list.map((x) => x.id);
      [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
      reorderList(ids, userId).then(setList);
    },
    [list, userId]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index >= list.length - 1) return;
      const ids = list.map((x) => x.id);
      [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
      reorderList(ids, userId).then(setList);
    },
    [list, userId]
  );

  const sorted = [...list].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-cream-100">
      <header className="border-b border-cream-300 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-medium text-stone-800 tracking-wide">
            Cosmepik
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gold-500/50 text-gold-700 py-2 px-4 text-sm font-medium hover:bg-cream-200 transition-colors"
            >
              プレビュー
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <section className="card-cream rounded-xl p-4 mb-5">
          <div className="flex items-center gap-4 flex-wrap">
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer shrink-0"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-cream-200 border border-cream-300 flex items-center justify-center ring-2 ring-transparent hover:ring-gold-400/30 transition-all">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-lg text-stone-400">✨</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setAvatarUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="avatar-upload"
              />
            </label>
            <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setDisplayName(tempName);
                          setEditingName(false);
                        } else if (e.key === "Escape") {
                          setTempName(displayName);
                          setEditingName(false);
                        }
                      }}
                      placeholder="表示名"
                      className="w-32 rounded-md border border-cream-300 bg-white px-2.5 py-1.5 text-sm text-stone-800"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayName(tempName);
                        setEditingName(false);
                      }}
                      className="rounded-md bg-gold-500 text-white px-2 py-1.5 text-xs hover:bg-gold-600"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(false);
                      }}
                      className="rounded-md border border-cream-300 text-stone-500 px-2 py-1.5 text-xs hover:bg-cream-200"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-stone-800 truncate">
                      {displayName || "名前を設定"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(true);
                      }}
                      className="rounded p-1 text-stone-400 hover:bg-cream-200 hover:text-gold-600 transition-colors"
                      aria-label="名前を編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="rounded-md border border-cream-300 bg-white/80 px-2.5 py-1.5 text-xs text-stone-700"
                >
                  {SKIN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={personalColor}
                  onChange={(e) => setPersonalColor(e.target.value)}
                  className="rounded-md border border-cream-300 bg-white/80 px-2.5 py-1.5 text-xs text-stone-700"
                >
                  {PERSONAL_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-medium text-stone-800 tracking-wide">
            マイリスト
          </h2>
          <Link
            href="/influencer/search"
            className="text-sm text-gold-600 hover:text-gold-700 font-medium"
          >
            ＋ コスメを追加
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-4 card-cream rounded-xl p-6 text-center text-stone-500 text-sm">
            <p>まだアイテムがありません。</p>
            <p className="mt-2 text-sm">
              上の「コスメを追加」から検索して追加できます。
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {sorted.map((item, index) => (
              <li
                key={item.id}
                className="card-cream rounded-xl p-4 flex gap-4 items-start"
              >
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-cream-200">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gold-600 font-medium">{item.brand}</p>
                  <h3 className="font-medium text-stone-800 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.comment && (
                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                      {item.comment}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-lg border border-cream-300 text-stone-500 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="上へ"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === sorted.length - 1}
                    className="p-2 rounded-lg border border-cream-300 text-stone-500 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="下へ"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    aria-label="削除"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
