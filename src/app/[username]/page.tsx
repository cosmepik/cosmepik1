"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { getProfileByUsername, getListByUsername } from "@/lib/store";
import type { InfluencerProfile, ListedCosmeItem } from "@/types";

interface PublicProfilePageProps {
  /** /demo から呼ぶときに渡す。未指定時は useParams().username を使用 */
  username?: string;
}

/**
 * ファン向け公開プロフィールページ
 * /[username] でアクセス。Supabase 連携時は DB から、未設定時は localStorage から表示。
 */
export default function PublicProfilePage({ username: usernameProp }: PublicProfilePageProps = {}) {
  const params = useParams();
  const pathname = usePathname();
  const username = usernameProp ?? (params?.username as string) ?? "demo";
  const isPreview = pathname === "/demo";

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [list, setList] = useState<ListedCosmeItem[]>([]);
  const [publishedMessage, setPublishedMessage] = useState(false);
  const [profileLink, setProfileLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const publishedMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getProfileByUsername(username).then(setProfile);
    getListByUsername(username).then(setList);
  }, [username]);

  const displayName = profile?.displayName ?? "コスメ好き";
  const bio = profile?.bio ?? "愛用コスメをまとめています。";
  const skinType = profile?.skinType;
  const personalColor = profile?.personalColor;
  const sortedList = useMemo(
    () => [...list].sort((a, b) => a.order - b.order),
    [list]
  );

  const handlePublish = () => {
    if (publishedMessageTimerRef.current) clearTimeout(publishedMessageTimerRef.current);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setProfileLink(`${origin}/${username}`);
    setPublishedMessage(true);
    setCopied(false);
    publishedMessageTimerRef.current = setTimeout(() => setPublishedMessage(false), 5000);
  };

  const handleCopyLink = async () => {
    if (!profileLink) return;
    try {
      await navigator.clipboard.writeText(profileLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: テキストを選択してユーザーに手動コピーしてもらう
      const input = document.getElementById("profile-link-input") as HTMLInputElement;
      input?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        {isPreview && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/influencer/manage"
                className="inline-flex items-center text-sm font-medium text-gold-600 hover:text-gold-700"
              >
                ← 管理画面に戻る
              </Link>
              <button
                type="button"
                onClick={handlePublish}
                className="rounded-lg bg-gold-500 text-white py-2 px-4 text-sm font-medium hover:bg-gold-600 transition-colors"
              >
                公開
              </button>
            </div>
            {publishedMessage && (
              <div className="mb-4 rounded-xl border border-gold-400/30 bg-gold-500/5 p-4 space-y-3">
                <p className="text-sm font-medium text-gold-700">
                  公開しました。
                </p>
                {profileLink && (
                  <div className="flex gap-2">
                    <input
                      id="profile-link-input"
                      type="text"
                      readOnly
                      value={profileLink}
                      className="flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 rounded-lg bg-gold-500 text-white py-2 px-4 text-sm font-medium hover:bg-gold-600 transition-colors"
                    >
                      {copied ? "コピーしました" : "コピー"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <header className="text-center mb-10">
          <div className="w-24 h-24 mx-auto rounded-full bg-cream-200 border-2 border-gold-400/30 flex items-center justify-center text-gold-600 text-3xl overflow-hidden">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              "✨"
            )}
          </div>
          <h1 className="mt-4 text-xl font-medium text-stone-800 tracking-wide">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-stone-500">@{username}</p>
          {(skinType || personalColor) && (
            <p className="mt-2 text-sm text-stone-500">
              {[skinType, personalColor].filter(Boolean).join(" · ")}
            </p>
          )}
          {bio && (
            <p className="mt-3 text-sm text-stone-600 max-w-sm mx-auto">
              {bio}
            </p>
          )}
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gold-700 tracking-wider uppercase">
            愛用コスメ
          </h2>
          {sortedList.length === 0 ? (
            <div className="card-cream rounded-2xl p-8 text-center text-stone-500 text-sm">
              まだアイテムがありません
            </div>
          ) : (
            <ul className="space-y-4">
              {sortedList.map((item) => (
                <li
                  key={item.id}
                  className="card-cream rounded-2xl p-4 overflow-hidden"
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-cream-200">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gold-600 font-medium">
                        {item.brand}
                      </p>
                      <h3 className="font-medium text-stone-800 mt-0.5">
                        {item.name}
                      </h3>
                      {item.comment && (
                        <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                          {item.comment}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={item.rakutenUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg bg-gold-500 text-white text-xs font-medium px-3 py-2 hover:bg-gold-600"
                        >
                          楽天で購入
                        </a>
                        <a
                          href={item.amazonUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-stone-300 text-stone-700 text-xs font-medium px-3 py-2 hover:bg-stone-100"
                        >
                          Amazonで購入
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-12 text-center">
          <p className="text-xs text-stone-400">Powered by Cosmepik</p>
        </footer>
      </div>
    </main>
  );
}
