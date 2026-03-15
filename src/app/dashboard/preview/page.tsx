"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getProfile } from "@/lib/store";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { ProfileThemeApplier } from "@/components/ProfileThemeApplier";
import { SectionProvider } from "@/lib/section-context";
import { ShareModal } from "@/components/ShareModal";
import { useProfile, toInfluencerProfile } from "@/lib/profile-context";
import type { InfluencerProfile } from "@/types";

function PreviewContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("slug") ?? "demo";
  const { profile: ctxProfile } = useProfile();

  const initialProfile: InfluencerProfile | null =
    ctxProfile.name
      ? { ...toInfluencerProfile(ctxProfile), list: [], updatedAt: new Date().toISOString() } as InfluencerProfile
      : null;

  const [profile, setProfile] = useState<InfluencerProfile | null>(initialProfile);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (ctxProfile.name && !profile?.displayName) {
      setProfile({ ...toInfluencerProfile(ctxProfile), list: [] } as InfluencerProfile);
    }
  }, [ctxProfile.name]);

  useEffect(() => {
    getProfile(username).then((full) => {
      if (full) setProfile(full);
    });
  }, [username]);

  useEffect(() => {
    const handler = () => getProfile(username).then((full) => { if (full) setProfile(full); });
    window.addEventListener("cosmepik-background-change", handler);
    return () => window.removeEventListener("cosmepik-background-change", handler);
  }, [username]);

  const profileLink =
    typeof window !== "undefined" ? `${window.location.origin}/p/${username}` : "";

  return (
    <>
      <div className="relative z-10 mx-auto max-w-[400px] px-4 pb-4 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/edit/${username}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← 編集画面に戻る
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
      </div>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={profileLink}
        title="共有"
      />
      <ProfileThemeApplier profile={profile} />
      <SectionProvider slug={username} userAffiliateId={profile?.rakutenAffiliateId}>
        <PublicProfileContent username={username} profile={profile} />
      </SectionProvider>
    </>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">読み込み中...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
