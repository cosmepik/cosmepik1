"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { getProfileByUsername } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { SectionProvider } from "@/lib/section-context";
import { ShareModal } from "@/components/ShareModal";
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
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    getProfileByUsername(username).then(setProfile);
  }, [username]);

  const profileLink =
    typeof window !== "undefined" ? `${window.location.origin}/p/${username}` : "";

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
              onClick={() => setShareOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-muted/50"
              aria-label="リンクを共有"
            >
              <Upload className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            url={profileLink}
            title="共有"
          />
        </div>
      )}
      <SectionProvider slug={username}>
        <PublicProfileContent username={username} profile={profile} />
      </SectionProvider>
    </>
  );
}
