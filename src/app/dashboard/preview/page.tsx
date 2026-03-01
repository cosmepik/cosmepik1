"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProfileByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { SectionProvider } from "@/lib/section-context";
import type { InfluencerProfile } from "@/types";

function PreviewContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("slug") ?? "demo";

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
      const textarea = document.createElement("textarea");
      textarea.value = profileLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-md px-4 pb-4 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/edit/${username}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← 編集画面に戻る
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
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
        {publishedMessage && profileLink && (
          <div className="mb-4 flex items-center gap-2">
            <a
              href={profileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-sm text-green hover:underline"
            >
              {profileLink}
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="URLをコピー"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      <SectionProvider slug={username}>
        <PublicProfileContent username={username} profile={profile} />
      </SectionProvider>
    </>
  );
}

/** プレビュー画面：UIBASE 完全準拠 */
export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">読み込み中...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
