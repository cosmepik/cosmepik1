"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [list, setList] = useState<ListedCosmeItem[]>([]);
  const [savedMessage, setSavedMessage] = useState(false);
  const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [skinType, setSkinType] = useState("");
  const [personalColor, setPersonalColor] = useState("");

  const load = useCallback(() => {
    getMyList().then(setList);
  }, []);

  const loadProfile = useCallback(() => {
    getProfile().then((p) => {
      setDisplayName(p?.displayName ?? "");
      setAvatarUrl(p?.avatarUrl ?? "");
      setSkinType(p?.skinType ?? "");
      setPersonalColor(p?.personalColor ?? "");
    });
  }, []);

  useEffect(() => {
    load();
    loadProfile();
  }, [load, loadProfile]);

  const handleSave = useCallback(async () => {
    const current = await getMyList();
    await setMyList(current);
    const p = await getProfile();
    await setProfile({
      username: p?.username ?? "demo",
      displayName,
      avatarUrl: avatarUrl || undefined,
      skinType: skinType || undefined,
      personalColor: personalColor || undefined,
      updatedAt: new Date().toISOString(),
    });
    if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current);
    setSavedMessage(true);
    saveMessageTimerRef.current = setTimeout(() => setSavedMessage(false), 3000);
  }, [displayName, avatarUrl, skinType, personalColor]);

  const handleRemove = useCallback((id: string) => {
    if (confirm("この商品をリストから削除しますか？")) {
      removeFromList(id).then(setList);
    }
  }, []);

  const moveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const ids = list.map((x) => x.id);
      [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
      reorderList(ids).then(setList);
    },
    [list]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index >= list.length - 1) return;
      const ids = list.map((x) => x.id);
      [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
      reorderList(ids).then(setList);
    },
    [list]
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
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-gold-500 text-white py-2 px-4 text-sm font-medium hover:bg-gold-600 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {savedMessage && (
          <p className="mb-4 rounded-lg bg-gold-500/10 text-gold-700 py-2 px-4 text-sm font-medium">
            保存しました。
          </p>
        )}

        <section className="card-cream rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-medium text-stone-500 tracking-wider mb-4">
            プロフィール
          </h2>
          <div className="flex gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-cream-200 border-2 border-cream-300 flex items-center justify-center">
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
                  <span className="text-2xl text-stone-400">✨</span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="text-xs text-stone-500 w-full text-center cursor-pointer"
              >
                <span className="block mb-1">アイコン画像を選択</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="avatar-upload"
                />
                <span className="inline-block rounded-lg border border-gold-500/50 text-gold-700 py-1.5 px-3 text-xs font-medium hover:bg-cream-200 transition-colors">
                  写真を選択
                </span>
              </label>
            </div>
            <div className="flex-1 min-w-[200px] space-y-4">
              <div className="block">
                <span className="block text-xs font-medium text-stone-600 mb-1">名前</span>
                {editingName ? (
                  <div className="flex items-center gap-2">
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
                      placeholder="表示名を入力"
                      className="flex-1 rounded-lg border border-cream-300 bg-white px-4 py-2 text-stone-800 placeholder-stone-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayName(tempName);
                        setEditingName(false);
                      }}
                      className="rounded-lg bg-gold-500 text-white px-3 py-2 text-xs font-medium hover:bg-gold-600"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(false);
                      }}
                      className="rounded-lg border border-cream-300 text-stone-600 px-3 py-2 text-xs hover:bg-cream-200"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 rounded-lg border border-cream-300 bg-white px-4 py-2 text-stone-800 min-h-[42px] flex items-center">
                      {displayName || "（未設定）"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(true);
                      }}
                      className="rounded-lg border border-cream-300 text-stone-500 px-3 py-2 hover:bg-cream-200"
                      aria-label="名前を編集"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <label className="block">
                <span className="block text-xs font-medium text-stone-600 mb-1">肌質</span>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 text-stone-800"
                >
                  {SKIN_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-stone-600 mb-1">パーソナルカラー</span>
                <select
                  value={personalColor}
                  onChange={(e) => setPersonalColor(e.target.value)}
                  className="w-full rounded-lg border border-cream-300 bg-white px-4 py-2 text-stone-800"
                >
                  {PERSONAL_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <h2 className="text-xl font-medium text-stone-800 tracking-wide">
          マイリスト管理
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          並び替えや削除ができます。公開ページにそのまま反映されます。
        </p>

        <Link
          href="/influencer/search"
          className="mt-4 inline-block text-sm text-gold-600 hover:text-gold-700 font-medium"
        >
          ＋ コスメを追加
        </Link>

        {sorted.length === 0 ? (
          <div className="mt-6 card-cream rounded-xl p-8 text-center text-stone-500">
            <p>まだアイテムがありません。</p>
            <p className="mt-2 text-sm">
              上の「コスメを追加」から検索して追加できます。
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
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
