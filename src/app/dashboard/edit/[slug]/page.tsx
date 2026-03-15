"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DesignEditButtons } from "@/components/cosme-link/design-edit-buttons";
import { ProfileHeader } from "@/components/cosme-link/profile-header";
import { SectionProvider } from "@/lib/section-context";
import { SectionRenderer } from "@/components/cosme-link/section-renderer";
import { AddSectionInline } from "@/components/cosme-link/add-section-inline";
import { useSections } from "@/lib/section-context";
import { getProfile, renameCosmeSet } from "@/lib/store";
import { ProfileProvider, toProfile, useProfile } from "@/lib/profile-context";
import { ProfileThemeLoader } from "@/components/ProfileThemeLoader";
import { ShareModal } from "@/components/ShareModal";

function EditPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { sections, isEditMode } = useSections();

  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [usePreset, setUsePreset] = useState(false);

  const loadProfile = useCallback(
    () =>
      getProfile(slug).then((p) => {
        setBackgroundImageUrl(p?.backgroundImageUrl ?? "");
        setUsePreset(!!p?.usePreset);
      }),
    [slug]
  );

  useEffect(() => {
    loadProfile();
  }, [slug, loadProfile]);

  useEffect(() => {
    const handler = () => loadProfile();
    window.addEventListener("cosmepik-background-change", handler);
    return () => window.removeEventListener("cosmepik-background-change", handler);
  }, [loadProfile]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempSlug, setTempSlug] = useState(slug);
  const [slugInputWarning, setSlugInputWarning] = useState<string | null>(null);
  useEffect(() => {
    setProfileUrl(typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : "");
  }, [slug]);
  useEffect(() => {
    setTempSlug(slug);
  }, [slug]);

  const hasJapaneseChars = (s: string) => /[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]/.test(s);

  useEffect(() => {
    if (editingUrl) {
      setSlugInputWarning(hasJapaneseChars(tempSlug) ? "半角英数で入力してください" : null);
    }
  }, [editingUrl, tempSlug]);

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
    setSlugInputWarning(null);
  }, [slug]);

  const handleSlugChange = useCallback((value: string) => {
    setTempSlug(value);
    setSlugInputWarning(hasJapaneseChars(value) ? "半角英数で入力してください" : null);
  }, []);

  return (
    <>
    <main className="relative min-h-screen">
      {backgroundImageUrl && !usePreset && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      <div className="relative z-10">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/preview?slug=${encodeURIComponent(slug)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
            >
              プレビュー
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
        }
      />

      <div className="mx-auto max-w-md px-4 py-5">
        {/* デザイン編集ボタン群（背景・テーマ） */}
        <DesignEditButtons
          slug={slug}
          hasBackground={!!backgroundImageUrl}
          onBackgroundChange={loadProfile}
          onBackgroundUrl={(url) => setBackgroundImageUrl(url)}
        />

        {/* 公開リンク（編集ボタン群） */}
        <div className="mx-auto mb-5 flex w-full max-w-[400px] justify-center items-center gap-2">
          {editingUrl ? (
            <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
                <span className="shrink-0 text-sm text-muted-foreground">
                  {typeof window !== "undefined" ? `${window.location.origin}/p/` : ""}
                </span>
                <input
                  type="text"
                  value={tempSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUrl();
                    else if (e.key === "Escape") handleCancelUrl();
                  }}
                  placeholder="url"
                  className="min-w-[80px] flex-1 border-0 bg-transparent px-0 py-0 text-base text-foreground outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="flex shrink-0 justify-center gap-2">
                <button type="button" onClick={handleSaveUrl} className="rounded-lg bg-green px-3 py-1.5 text-sm text-white">
                  OK
                </button>
                <button type="button" onClick={handleCancelUrl} className="rounded-lg border border-input bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                  キャンセル
                </button>
              </div>
              {slugInputWarning && (
                <p className="w-full text-center text-sm text-amber-600">{slugInputWarning}</p>
              )}
            </div>
          ) : (
            <div className="relative flex justify-center">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex max-w-sm items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground no-underline shadow-sm transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0 truncate">{profileUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
              <button
                type="button"
                onClick={() => setEditingUrl(true)}
                className="absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="URLを編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <ProfileHeader />

        <div className="mx-auto mt-6 flex max-w-[400px] flex-col gap-2">
          {isEditMode && sections.length === 0 && (
            <AddSectionInline insertIndex={0} />
          )}
          {sections.map((section, index) => (
            <div key={section.id} className="flex flex-col gap-2">
              <SectionRenderer section={section} />
              {isEditMode && (
                <AddSectionInline insertIndex={index + 1} />
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </main>
    <ShareModal
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      url={profileUrl}
      title="共有"
    />
    </>
  );
}

function EditPageWithSections({ slug }: { slug: string }) {
  const { profile } = useProfile();
  return (
    <SectionProvider slug={slug} userAffiliateId={profile.rakutenAffiliateId || undefined} defaultEditMode>
      <EditPageContent slug={slug} />
    </SectionProvider>
  );
}

/** 編集画面：storeからプロフィールを事前取得してProfileProviderに渡し、戻ってきた際も正しく表示 */
export default function EditPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "demo";
  const [initialProfile, setInitialProfile] = useState<ReturnType<typeof toProfile> | null>(null);

  useEffect(() => {
    getProfile(slug).then((p) => {
      setInitialProfile(toProfile(p, slug));
    });
  }, [slug]);

  return (
    <ProfileProvider key={slug} slug={slug} initialProfile={initialProfile}>
      <ProfileThemeLoader slug={slug} />
      <EditPageWithSections slug={slug} />
    </ProfileProvider>
  );
}
