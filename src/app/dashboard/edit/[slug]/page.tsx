"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SidebarNav } from "@/components/SidebarNav";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DesignEditButtons } from "@/components/cosme-link/design-edit-buttons";
import { ProfileHeader } from "@/components/cosme-link/profile-header";
import { SectionProvider } from "@/lib/section-context";
import { ProfileProvider } from "@/lib/profile-context";
import { SectionRenderer } from "@/components/cosme-link/section-renderer";
import { AddSectionInline } from "@/components/cosme-link/add-section-inline";
import { useSections } from "@/lib/section-context";
import { getProfile, renameCosmeSet } from "@/lib/store";

function EditPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { sections, isEditMode } = useSections();

  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const loadProfile = useCallback(
    () =>
      getProfile(slug).then((p) => {
        setBackgroundImageUrl(p?.backgroundImageUrl ?? "");
      }),
    [slug]
  );

  useEffect(() => {
    loadProfile();
  }, [slug, loadProfile]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempSlug, setTempSlug] = useState(slug);
  useEffect(() => {
    setProfileUrl(typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : "");
  }, [slug]);
  useEffect(() => {
    setTempSlug(slug);
  }, [slug]);

  const handleSaveUrl = useCallback(async () => {
    const newSlug = tempSlug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    if (!newSlug || newSlug === slug) {
      setTempSlug(slug);
      setEditingUrl(false);
      return;
    }
    const ok = await renameCosmeSet(slug, newSlug);
    if (ok) {
      setEditingUrl(false);
      router.push(`/dashboard/edit/${newSlug}`);
    } else {
      alert("このURLは既に使用されています。別のURLを試してください。");
    }
  }, [slug, tempSlug, router]);

  const handleCancelUrl = useCallback(() => {
    setTempSlug(slug);
    setEditingUrl(false);
  }, [slug]);

  return (
    <>
    <main className="min-h-screen">
      <SidebarNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <Link
            href={`/dashboard/preview?slug=${encodeURIComponent(slug)}`}
            className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            プレビュー
          </Link>
        }
      />

      <div className="mx-auto max-w-md px-4 py-5">
        {/* デザイン編集ボタン群（背景・テーマ） */}
        <DesignEditButtons slug={slug} hasBackground={!!backgroundImageUrl} onBackgroundChange={loadProfile} />

        {/* 公開リンク（編集ボタン群） */}
        <div className="mb-5 flex items-center gap-2">
          {editingUrl ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="shrink-0 text-sm text-muted-foreground">
                {typeof window !== "undefined" ? `${window.location.origin}/p/` : ""}
              </span>
              <input
                type="text"
                value={tempSlug}
                onChange={(e) => setTempSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveUrl();
                  else if (e.key === "Escape") handleCancelUrl();
                }}
                placeholder="url"
                className="min-w-0 flex-1 rounded-lg border border-input bg-white px-2.5 py-1.5 text-sm text-card-foreground"
                autoFocus
              />
              <button type="button" onClick={handleSaveUrl} className="shrink-0 rounded-lg bg-green px-2 py-1.5 text-xs text-white">
                OK
              </button>
              <button type="button" onClick={handleCancelUrl} className="shrink-0 rounded-lg border border-input bg-secondary px-2 py-1.5 text-xs text-muted-foreground">
                キャンセル
              </button>
            </div>
          ) : (
            <>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-green hover:underline"
              >
                {profileUrl}
              </a>
              <button
                type="button"
                onClick={() => setEditingUrl(true)}
                className="shrink-0 rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="URLを編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => profileUrl && navigator.clipboard.writeText(profileUrl)}
                className="shrink-0 rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="URLをコピー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              </button>
            </>
          )}
        </div>

        <ProfileHeader />

        {/* セクション */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">セクション</h2>
        </div>
        <div className="mt-4 flex flex-col gap-6">
          {isEditMode && sections.length === 0 && (
            <AddSectionInline insertIndex={0} />
          )}
          {sections.map((section, index) => (
            <div key={section.id} className="flex flex-col gap-4">
              <SectionRenderer section={section} />
              {isEditMode && (
                <AddSectionInline insertIndex={index + 1} />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
    </>
  );
}

/** 編集画面：UIBASE 完全準拠 */
export default function EditPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "demo";

  return (
    <SectionProvider slug={slug} defaultEditMode>
      <ProfileProvider slug={slug}>
        <EditPageContent slug={slug} />
      </ProfileProvider>
    </SectionProvider>
  );
}
