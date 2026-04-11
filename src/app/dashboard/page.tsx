"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Copy,
  Crown,
  Plus,
  MoreHorizontal,
  Pencil,
  Clipboard,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  createCosmeSet,
  deleteCosmeSet,
  updateCosmeSetName,
  seedProfileCache,
  getSections,
} from "@/lib/store";
import type { CosmeSet, CosmeSetMode, InfluencerProfile } from "@/types";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

interface DashboardUser {
  id: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "おはようございます";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

export default function DashboardHomePage() {
  const router = useRouter();
  const [dashUser, setDashUser] = useState<DashboardUser | null>(null);
  const userId = dashUser?.id ?? "demo";
  const isAdmin = dashUser?.email === ADMIN_EMAIL;
  const metadata = dashUser?.metadata as Record<string, string> | undefined;

  const [sets, setSets] = useState<CosmeSet[]>([]);
  const displayName =
    sets[0]?.displayName ??
    metadata?.full_name ??
    metadata?.name ??
    (metadata?.user_name ? `@${metadata.user_name}` : null) ??
    null;
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [slugInputError, setSlugInputError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CosmeSetMode>("recipe");

  const load = useCallback(() => {
    const timeout = setTimeout(() => setLoading(false), 10000);
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setDashUser(data.user);
        setSets(data.sets ?? []);
        setIsPremium(!!data.premium);
        const slugs: string[] = [];
        if (data.profiles) {
          for (const [slug, p] of Object.entries(data.profiles)) {
            slugs.push(slug);
            const raw = p as Record<string, unknown>;
            seedProfileCache(slug, {
              username: raw.username as string,
              displayName: (raw.display_name as string) ?? "",
              avatarUrl: (raw.avatar_url as string) ?? undefined,
              backgroundImageUrl: (raw.background_image_url as string) ?? undefined,
              usePreset: (raw.use_preset as boolean) ?? undefined,
              themeId: (raw.theme_id as string) ?? undefined,
              backgroundId: (raw.background_id as string) ?? undefined,
              fontId: (raw.font_id as string) ?? undefined,
              cardDesignId: (raw.card_design_id as string) ?? undefined,
              bio: (raw.bio as string) ?? undefined,
              bioSub: (raw.bio_sub as string) ?? undefined,
              skinType: (raw.skin_type as string) ?? undefined,
              personalColor: (raw.personal_color as string) ?? undefined,
              snsLinks: raw.sns_links as InfluencerProfile["snsLinks"],
              rakutenAffiliateId: (raw.rakuten_affiliate_id as string) ?? undefined,
              list: [],
              updatedAt: (raw.updated_at as string) ?? new Date().toISOString(),
            });
          }
        }
        for (const s of slugs) getSections(s).catch(() => {});
      })
      .catch(() => setSets([]))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && dashUser && sets.length === 0) {
      router.replace("/dashboard/onboarding");
    }
  }, [loading, dashUser, sets.length, router]);

  const canCreateMore = isAdmin || isPremium || sets.length < 2;

  const handleDeleteSet = useCallback(
    async (set: CosmeSet) => {
      setOpenMenuSetId(null);
      if (!confirm(`「${set.name}」を削除しますか？この操作は取り消せません。`))
        return;
      const ok = await deleteCosmeSet(userId, set.slug);
      if (ok) load();
    },
    [userId, load],
  );

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
    setCreateName("");
    setCreateSlug("");
    setCreateFormError(null);
    setCreateError(null);
    setSlugInputError(null);
    setCreateMode("recipe");
  }, []);

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError(null);
    const name = createName.trim();
    const slug = normalizeSlug(createSlug);
    if (!name) {
      setCreateFormError("名前を入力してください");
      return;
    }
    if (!slug) {
      setCreateFormError("URLを入力してください");
      return;
    }
    if (sets.some((s) => s.slug === slug)) {
      setCreateFormError("このURLは既に使用されています");
      return;
    }
    setCreating(true);
    try {
      const timeoutMs = 8000;
      const createPromise = createCosmeSet(userId, name, slug, createMode);
      const timeoutPromise = new Promise<CosmeSet | null>((_, reject) =>
        setTimeout(() => reject(new Error("タイムアウトしました")), timeoutMs),
      );
      const newSet = await Promise.race([createPromise, timeoutPromise]);
      if (newSet) {
        setCreateModalOpen(false);
        router.push(`/dashboard/edit/${newSet.slug}`);
      } else {
        setCreateFormError("作成に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      setCreateFormError(
        err instanceof Error ? err.message : "作成に失敗しました",
      );
    } finally {
      setCreating(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenuSetId, setOpenMenuSetId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<CosmeSet | null>(null);
  const [editingName, setEditingName] = useState("");
  const [generatingCodeFor, setGeneratingCodeFor] = useState<string | null>(
    null,
  );
  const [inviteCodesBySlug, setInviteCodesBySlug] = useState<
    Record<string, { claim_code: string; is_claimed: boolean }>
  >({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin || sets.length === 0) return;
    fetch("/api/invite/codes")
      .then((res) => res.json())
      .then((data) => {
        const bySlug: Record<
          string,
          { claim_code: string; is_claimed: boolean }
        > = {};
        for (const c of data.codes ?? []) {
          if (c.slug)
            bySlug[c.slug] = {
              claim_code: c.claim_code,
              is_claimed: c.is_claimed,
            };
        }
        setInviteCodesBySlug(bySlug);
      })
      .catch(() => {});
  }, [isAdmin, sets.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpenMenuSetId(null);
      }
    };
    if (openMenuSetId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuSetId]);

  const handleCopyUrl = useCallback((set: CosmeSet) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/${set.slug}`
        : "";
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("URLをコピーしました");
    }
    setOpenMenuSetId(null);
  }, []);

  const handleStartRename = useCallback((set: CosmeSet) => {
    setOpenMenuSetId(null);
    setEditingSet(set);
    setEditingName(set.name);
  }, []);

  const handleSaveRename = useCallback(async () => {
    if (!editingSet) {
      setEditingSet(null);
      return;
    }
    const newName = editingName.trim();
    setEditingSet(null);
    if (!newName) return;
    const ok = await updateCosmeSetName(userId, editingSet.slug, newName);
    if (ok) load();
  }, [editingSet, editingName, userId, load]);

  const handleCancelRename = useCallback(() => {
    setEditingSet(null);
    setEditingName("");
  }, []);

  const handleGenerateInviteCode = useCallback(
    async (set: CosmeSet) => {
      setOpenMenuSetId(null);
      setGeneratingCodeFor(set.id);
      try {
        const res = await fetch("/api/invite/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: set.slug }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error ?? "コードの生成に失敗しました");
          return;
        }
        const code = data.claim_code;
        setInviteCodesBySlug((prev) => ({
          ...prev,
          [set.slug]: { claim_code: code, is_claimed: false },
        }));
        navigator.clipboard.writeText(code);
        toast.success(`招待コード ${code} をコピーしました`);
      } catch {
        toast.error("コードの生成に失敗しました");
      } finally {
        setGeneratingCodeFor(null);
      }
    },
    [],
  );

  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [blogPosts, setBlogPosts] = useState<{ id: string; title: string; category: string; thumbnail_url?: string; created_at: string }[]>([]);

  useEffect(() => {
    fetch("/api/analytics/views")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setTotalViews(data.total ?? 0);
      })
      .catch(() => {});
    fetch("/api/admin/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.posts) setBlogPosts(data.posts.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (!loading && sets.length > 0 && sessionStorage.getItem("cosmepik-show-welcome") === "1") {
      sessionStorage.removeItem("cosmepik-show-welcome");
      setShowWelcome(true);
    }
  }, [loading, sets.length]);

  const setCardGradients = [
    "from-pink-400/80 to-rose-400/80",
    "from-violet-400/80 to-purple-400/80",
    "from-teal-400/80 to-emerald-400/80",
    "from-amber-400/80 to-orange-400/80",
    "from-sky-400/80 to-blue-400/80",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/40 via-background to-background" style={{ fontFamily: "'Shippori Mincho', serif" }}>
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="mx-auto max-w-md px-4 pb-12 pt-6">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
            {displayName ? `${displayName} さん` : "マイページ"}
          </h1>
        </div>

        {/* Total Views */}
        {totalViews !== null && (
          <div
            className="mb-5 flex items-center gap-4 rounded-2xl bg-white px-5 py-2.5 shadow-sm"
            style={{ border: "1.5px solid #eee" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Eye className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground">ページ総閲覧数</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-foreground">{totalViews.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">views</span></p>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            マイメイクレシピ
          </h2>
          {!loading && sets.length > 0 && (
            <span className="text-xs text-muted-foreground">
              タップして編集
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/30 border-t-primary" />
            <p className="text-sm text-muted-foreground">メイクレシピを読み込み中... 5秒くらい待ってね</p>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {sets.length === 0 && (
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-8 text-center shadow-lg shadow-primary/10 ring-1 ring-black/5" style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--primary) 35%, white) 0%, color-mix(in oklch, var(--primary) 20%, white) 50%, color-mix(in oklch, var(--primary) 45%, white) 100%)" }}>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative">
                  <p className="text-sm font-medium text-foreground">
                    はじめてのメイクレシピを作ろう
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    お気に入りのコスメをまとめて
                    <br />
                    あなただけのリンクを共有しましょう
                  </p>
                </div>
              </div>
            )}

            {/* Cosme Set List */}
            <ul className="space-y-3">
              {sets.map((set, i) => (
                <li key={set.id} className="group relative">
                  <div className="flex items-stretch gap-2">
                    {editingSet?.id === set.id ? (
                      <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${setCardGradients[i % setCardGradients.length]} shadow-sm`}
                        >
                          {set.avatarUrl ? (
                            <img
                              src={set.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {set.name[0] ?? "C"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename();
                              if (e.key === "Escape") handleCancelRename();
                            }}
                            onBlur={handleSaveRename}
                            autoFocus
                            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-card-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {set.itemCount ?? 0} 件のコスメ
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/dashboard/edit/${set.slug}`}
                        className={`flex min-w-0 flex-1 items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-rose-200/60 ${showWelcome && i === 0 ? "border-primary ring-2 ring-primary/30 ring-offset-2" : "border-border"}`}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${setCardGradients[i % setCardGradients.length]} shadow-sm`}
                        >
                          {set.avatarUrl ? (
                            <img
                              src={set.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {set.name[0] ?? "C"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {set.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {set.itemCount ?? 0} 件のコスメ
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}

                    {/* Context Menu Trigger */}
                    <div
                      className="relative flex shrink-0"
                      ref={
                        openMenuSetId === set.id ? menuRef : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenuSetId((prev) =>
                            prev === set.id ? null : set.id,
                          );
                        }}
                        className="flex items-center justify-center rounded-2xl border border-border bg-white p-3 text-muted-foreground shadow-sm transition-colors hover:bg-rose-50 hover:text-foreground hover:border-rose-200/60"
                        aria-label="メニュー"
                        aria-expanded={openMenuSetId === set.id}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {openMenuSetId === set.id && (
                        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-white/95 py-1.5 shadow-xl shadow-black/5 backdrop-blur-md">
                          {isAdmin &&
                            inviteCodesBySlug[set.slug] && (
                              <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                  招待コード
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <code className="font-mono text-xs font-bold tracking-wider text-foreground">
                                    {
                                      inviteCodesBySlug[set.slug]
                                        .claim_code
                                    }
                                  </code>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText(
                                        inviteCodesBySlug[set.slug]
                                          .claim_code,
                                      );
                                      toast.success("コピーしました");
                                    }}
                                    className="rounded-md p-1 hover:bg-muted"
                                    aria-label="コピー"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleGenerateInviteCode(set);
                              }}
                              disabled={
                                generatingCodeFor === set.id ||
                                !!inviteCodesBySlug[set.slug]
                              }
                              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/50 disabled:opacity-40"
                            >
                              <Ticket className="h-4 w-4 shrink-0 text-muted-foreground" />
                              {generatingCodeFor === set.id
                                ? "生成中..."
                                : inviteCodesBySlug[set.slug]
                                  ? "招待コード発行済み"
                                  : "招待コードを発行"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleStartRename(set);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                          >
                            <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
                            名前を変更
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCopyUrl(set);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                          >
                            <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                            URLをコピー
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const url =
                                typeof window !== "undefined"
                                  ? `${window.location.origin}/${set.slug}`
                                  : "";
                              if (url) window.open(url, "_blank");
                              setOpenMenuSetId(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                          >
                            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                            公開ページを開く
                          </button>
                          <div className="mx-3 my-1 border-t border-border/60" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteSet(set);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-500 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            メイクレシピを消去
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Create / Premium CTA */}
            {createError && (
              <p className="mt-4 text-sm text-destructive">{createError}</p>
            )}
            {canCreateMore && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                新しいメイクレシピを作成
              </button>
            )}
            {!isAdmin && !isPremium && (
              <Link
                href="/dashboard/premium"
                className="mt-4 flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 transition-all hover:shadow-md hover:shadow-amber-100/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
                  <Crown className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">プレミアムプランで複数作成</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">無料プランではメイクレシピは2つまでです</p>
                </div>
              </Link>
            )}

            {/* Welcome Popup */}
            {showWelcome && sets.length > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
                  onClick={() => setShowWelcome(false)}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-white p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-4xl">🎉</div>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <h2 className="text-lg font-bold text-foreground">ようこそ cosmepik へ！</h2>
                    <p className="text-sm text-muted-foreground">
                      まずはメイクレシピを編集しましょう！
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcome(false);
                      router.push(`/dashboard/edit/${sets[0].slug}`);
                    }}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
                  >
                    編集する
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWelcome(false)}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    あとで
                  </button>
                </div>
              </div>
            )}

            {/* Create Modal */}
            {createModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-modal-title"
                onClick={() => setCreateModalOpen(false)}
              >
                <div
                  className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-black/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="relative overflow-hidden bg-primary/5 px-6 pb-5 pt-6">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                    <div className="relative">
                      <h2
                        id="create-modal-title"
                        className="text-lg font-bold text-foreground"
                      >
                        新しいメイクレシピを作成
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        名前とあなた専用のURLを決めましょう
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateSet}
                    className="space-y-5 px-6 pb-6 pt-5"
                  >
                    {/* Mode Selection */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">表示モード</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCreateMode("recipe")}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-2 pb-3 transition-all ${createMode === "recipe" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                        >
                          <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg">
                            <Image
                              src="/hero-mockup.png"
                              alt="レシピモード"
                              fill
                              className="object-cover object-top"
                              sizes="150px"
                            />
                          </div>
                          <div
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: "#e8729a" }}
                          >
                            レシピモード
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">写真の上にコスメを表示できるモード</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreateMode("simple")}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-2 pb-3 transition-all ${createMode === "simple" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
                        >
                          <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg">
                            <Image
                              src="/simple-mockup.png"
                              alt="シンプルモード"
                              fill
                              className="object-cover object-top"
                              sizes="150px"
                            />
                          </div>
                          <div
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                            style={{ background: "#9b8ec4" }}
                          >
                            シンプルモード
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">コスメをカードで並べるモード</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-baseline gap-1.5">
                        <label
                          htmlFor="create-name"
                          className="text-sm font-medium text-foreground"
                        >
                          メイクレシピの名前
                        </label>
                        <span className="text-[10px] text-muted-foreground">（あとから変更できるよ）</span>
                      </div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        アイコンの下に表示される名前です
                      </p>
                      <input
                        id="create-name"
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="あなたの名前を入力"
                        className="w-full rounded-xl border border-input bg-white px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="create-slug"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        コスメページのURLを決めましょう
                      </label>
                      <p className="mb-2 text-xs text-muted-foreground">
                        半角英数で入力してね（あとから変更できるよ）
                      </p>
                      <div className="flex overflow-hidden rounded-xl border-2 border-input bg-white transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        <span className="flex items-center bg-muted/50 pl-4 pr-2 text-sm font-medium text-muted-foreground shrink-0 border-r border-input">
                          cosmepik.me/
                        </span>
                        <input
                          id="create-slug"
                          type="text"
                          lang="en"
                          autoComplete="off"
                          value={createSlug}
                          onChange={(e) => {
                            const value = e.target.value;
                            const filtered = value.replace(
                              /[^a-zA-Z0-9\-_]/g,
                              "",
                            );
                            if (
                              (e.nativeEvent as InputEvent).isComposing
                            ) {
                              setCreateSlug(value);
                              setSlugInputError(null);
                            } else {
                              setCreateSlug(filtered);
                              setSlugInputError(
                                value !== filtered
                                  ? "半角英数で入力してください"
                                  : null,
                              );
                            }
                          }}
                          onCompositionEnd={(e) => {
                            const value = (e.target as HTMLInputElement)
                              .value;
                            const filtered = value.replace(
                              /[^a-zA-Z0-9\-_]/g,
                              "",
                            );
                            setCreateSlug(filtered);
                            setSlugInputError(
                              value !== filtered
                                ? "半角英数で入力してください"
                                : null,
                            );
                          }}
                          placeholder=""
                          className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-3 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                      {slugInputError && (
                        <p className="mt-1.5 text-sm text-destructive">
                          {slugInputError}
                        </p>
                      )}
                    </div>
                    {createFormError && (
                      <p className="text-sm text-destructive">
                        {createFormError}
                      </p>
                    )}
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {creating ? "作成中..." : "作成する"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-pink-400" />
              <h2 className="text-sm font-bold text-foreground">#cosmepik編集部</h2>
            </div>
            <div style={{ border: "1.5px dashed #333" }}>
              {blogPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group flex items-center gap-3 px-3 py-2 transition-all hover:opacity-80"
                  style={i > 0 ? { borderTop: "1.5px dashed #333" } : undefined}
                >
                  {post.thumbnail_url ? (
                    <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-lg">
                      <Image src={post.thumbnail_url} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-lg bg-pink-50">
                      <span className="text-xl">📝</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="text-[11px] font-bold text-pink-400">{post.category}</span>
                    <p className="mt-1 text-[13px] font-bold leading-[1.45] text-foreground line-clamp-2">
                      {post.title}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/blog"
                className="flex items-center justify-center py-3 text-[13px] font-bold tracking-[0.15em] transition-opacity hover:opacity-60"
                style={{ color: "#1a1a1a", borderTop: "1.5px dashed #333" }}
              >
                VIEW MORE
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
