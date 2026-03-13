"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { PublicProfileContent } from "@/components/PublicProfileContent";
import { ProfileThemeApplier } from "@/components/ProfileThemeApplier";
import { SectionProvider } from "@/lib/section-context";
import { ShareModal } from "@/components/ShareModal";

export default function DemoPage() {
  const username = "demo";
  const [shareOpen, setShareOpen] = useState(false);
  const profileLink =
    typeof window !== "undefined" ? `${window.location.origin}/p/${username}` : "";

  return (
    <>
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
      <ProfileThemeApplier profile={null} />
      <SectionProvider slug={username}>
        <PublicProfileContent username={username} profile={null} />
      </SectionProvider>
    </>
  );
}
