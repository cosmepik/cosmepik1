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
import { getProfile, renameCosmeSet, flushSections } from "@/lib/store";
import { ProfileProvider, toProfile, useProfile } from "@/lib/profile-context";
import { ProfileThemeLoader } from "@/components/ProfileThemeLoader";
import { ShareModal } from "@/components/ShareModal";
import { SetupGuide } from "@/components/cosme-link/setup-guide";
import { useStylePickerOpen } from "@/components/cosme-link/style-picker";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { RecipeEditor } from "@/components/cosme-link/recipe-editor";

const WELCOME_DISMISSED_KEY = "cosmepik-welcome-dismissed";

function WelcomePopup() {
  const [show, setShow] = useState(false);
  const { openWithTab } = useStylePickerOpen();

  useEffect(() => {
    if (localStorage.getItem(WELCOME_DISMISSED_KEY) === "true") return;
    setShow(true);
  }, []);

  if (!show) return null;

  const handleStart = () => {
    setShow(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    openWithTab("background");
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-white p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <CosmepikLogo height={22} color="var(--primary)" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-lg font-bold text-foreground">編集ページへようこそ！</h2>
          <p className="text-sm text-muted-foreground">まずは、壁紙を設定しよう！</p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          壁紙を選ぶ
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          あとで設定する
        </button>
      </div>
    </div>
  );
}

function EditPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { sections, isEditMode, isLoading } = useSections();
  const { setIsRecipeMode } = useStylePickerOpen();

  const isRecipe = sections.some((s) => s.type === "recipe");
  useEffect(() => {
    setIsRecipeMode(isRecipe);
  }, [isRecipe, setIsRecipeMode]);

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
            <button
              type="button"
              onClick={() => {
                flushSections(slug);
                router.push(`/dashboard/preview?slug=${encodeURIComponent(slug)}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
            >
              プレビュー
            </button>
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

      <div className="mx-auto max-w-md px-4 pt-0 pb-5">
        {/* 他の子のページを見るバナー（ビューポート幅で中央揃え） */}
        <div className="relative mb-4 w-screen max-w-none ml-[calc(-50vw+50%)]">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-1.5 rounded-none border-b border-border bg-white py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted/50"
          >
            他の子のページを参考にする
            <span aria-hidden>👀</span>
          </Link>
        </div>

        {/* デザイン編集ボタン群（背景・テーマ） */}
        <DesignEditButtons
          slug={slug}
          hasBackground={!!backgroundImageUrl}
          onBackgroundChange={loadProfile}
          onBackgroundUrl={(url) => setBackgroundImageUrl(url)}
        />

        {/* 公開リンク（編集ボタン群） */}
        <div className="mx-auto mb-5 w-full max-w-[400px]">
          {editingUrl ? (
            <div className="flex flex-col gap-2 px-1">
              <div className="flex items-center gap-2 rounded-xl border-2 border-primary/40 bg-white px-3 py-2.5 shadow-sm">
                <span className="shrink-0 text-xs text-muted-foreground">/p/</span>
                <input
                  type="text"
                  value={tempSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUrl();
                    else if (e.key === "Escape") handleCancelUrl();
                  }}
                  enterKeyHint="done"
                  placeholder="your-url"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              {slugInputWarning && (
                <p className="text-center text-xs text-amber-600">{slugInputWarning}</p>
              )}
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={handleCancelUrl}
                  className="rounded-full border border-border bg-secondary px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent active:scale-95"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground/80 no-underline shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <span className="min-w-0 truncate">{profileUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </a>
              <button
                type="button"
                onClick={() => setEditingUrl(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground active:scale-95"
                aria-label="URLを編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mx-auto mt-16 flex max-w-[400px] flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">読み込み中...</p>
          </div>
        ) : (
          <>
            <ProfileHeader />

            <div className="mx-auto mt-3 flex max-w-[400px] flex-col gap-2">
              {sections.some((s) => s.type === "recipe") ? (
                <RecipeEditor />
              ) : (
                <>
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
                </>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </main>
    <ShareModal
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      url={profileUrl}
      title="共有"
    />
    <WelcomePopup />
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
