"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { getProfileByUsername, getListByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import type { InfluencerProfile, ListedCosmeItem } from "@/types";

interface PublicProfilePageProps {
  /** /demo から呼ぶときに渡す。未指定時は useParams().username を使用 */
  username?: string;
}

/**
 * プレビュー用（/demo）：管理画面に戻る・公開・リンクコピー付き。
 * 実際のコンテンツは PublicProfileContent で共通表示。
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

  const sortedList = useMemo(
    () => [...list].sort((a, b) => a.order - b.order),
    [list]
  );

  const handlePublish = () => {
    if (publishedMessageTimerRef.current) clearTimeout(publishedMessageTimerRef.current);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setProfileLink(`${origin}/p/${username}`);
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
    <>
      {isPreview && (
        <div className="max-w-lg mx-auto px-4 pt-10 pb-4">
          <div className="mb-4 flex items-center justify-between">
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
        </div>
      )}
      <PublicProfileContent
        username={username}
        profile={profile}
        sortedList={sortedList}
      />
    </>
  );
}
