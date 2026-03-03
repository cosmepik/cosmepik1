"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getProfileByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { SectionProvider } from "@/lib/section-context";
import type { InfluencerProfile } from "@/types";

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
  const [publishedMessage, setPublishedMessage] = useState(false);
  const [profileLink, setProfileLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const publishedMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getProfileByUsername(username).then(setProfile);
  }, [username]);

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
        <div className="mx-auto max-w-md px-4 pb-4 pt-10">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-green hover:underline"
            >
              ← ダッシュボードに戻る
            </Link>
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
            >
              {publishedMessage ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>公開しました</span>
                </>
              ) : (
                "公開"
              )}
            </button>
          </div>
          {publishedMessage && (
            <div className="mb-4 space-y-3 rounded-xl border border-border bg-secondary p-4">
              <p className="text-sm font-medium text-foreground">
                公開しました。
              </p>
              {profileLink && (
                <div className="flex gap-2">
                  <input
                    id="profile-link-input"
                    type="text"
                    readOnly
                    value={profileLink}
                    className="flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm text-card-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 rounded-lg bg-green py-2 px-4 text-sm font-medium text-white transition-colors hover:opacity-90"
                  >
                    {copied ? "コピーしました" : "コピー"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <SectionProvider slug={username}>
        <PublicProfileContent username={username} profile={profile} />
      </SectionProvider>
    </>
  );
}
