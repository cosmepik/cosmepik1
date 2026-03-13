"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Copy,
  Crown,
  Sparkles,
  Plus,
  MoreHorizontal,
  Pencil,
  Clipboard,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import {
  getCosmeSets,
  createCosmeSet,
  deleteCosmeSet,
  updateCosmeSetName,
} from "@/lib/store";
import type { CosmeSet } from "@/types";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

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
  const { user, loading: authLoading } = useUser();
  const userId = user?.id ?? "demo";
  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    (user?.user_metadata?.user_name
      ? `@${user.user_metadata.user_name}`
      : null);

  const [sets, setSets] = useState<CosmeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [slugInputError, setSlugInputError] = useState<string | null>(null);

  const load = useCallback(() => {
    const timeout = setTimeout(() => setLoading(false), 10000);
    getCosmeSets(userId)
      .then((data) => setSets(data ?? []))
      .catch(() => setSets([]))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      load();
      fetch("/api/premium/me")
        .then((r) => r.json())
        .then((d) => setIsPremium(!!d.premium))
        .catch(() => {});
    }
  }, [load, authLoading]);

  const canCreateMore = isAdmin || isPremium || sets.length < 1;

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
      const createPromise = createCosmeSet(userId, name, slug);
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
        ? `${window.location.origin}/p/${set.slug}`
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

  const setCardGradients = [
    "from-pink-400/80 to-rose-400/80",
    "from-violet-400/80 to-purple-400/80",
    "from-teal-400/80 to-emerald-400/80",
    "from-amber-400/80 to-orange-400/80",
    "from-sky-400/80 to-blue-400/80",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/40 via-background to-background">
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

        {/* Section Title */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            マイコスメセット
          </h2>
          {!loading && !authLoading && sets.length > 0 && (
            <span className="text-xs text-muted-foreground">
              タップして編集
            </span>
          )}
        </div>

        {loading || authLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-2xl bg-muted/50"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Empty State */}
            {sets.length === 0 && (
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-8 text-center">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-100/50 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-pink-100/50 blur-2xl" />
                <div className="relative">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Sparkles className="h-7 w-7 text-rose-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    はじめてのコスメセットを作ろう
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
                        className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-rose-200/60"
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
                                  ? `${window.location.origin}/p/${set.slug}`
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
                            コスメセットを消去
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
            {canCreateMore ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200/60 bg-rose-50/30 py-5 text-sm font-medium text-muted-foreground transition-all hover:border-rose-300 hover:bg-rose-50/60 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                新しいコスメセットを作成
              </button>
            ) : (
              <Link
                href="/dashboard/premium"
                className="mt-4 flex w-full flex-col items-center gap-2.5 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 py-6 text-center transition-all hover:shadow-md hover:shadow-amber-100/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  プレミアムプランで複数のコスメセットを作成
                </span>
                <span className="text-xs text-muted-foreground">
                  無料プランではコスメセットは1つまでです
                </span>
              </Link>
            )}

            {/* #cosmepik編集部 */}
            <section className="mt-10">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-muted-foreground">
                  #cosmepik編集部
                </span>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-50 blur-xl" />
                <p className="relative text-sm text-muted-foreground">
                  いっしょうけんめい準備中！
                </p>
              </div>
            </section>

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
                  <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-white px-6 pb-5 pt-6">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-100/50 blur-2xl" />
                    <div className="relative">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-200/50">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h2
                        id="create-modal-title"
                        className="text-lg font-bold text-foreground"
                      >
                        新しいコスメセットを作成
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
                    <div>
                      <label
                        htmlFor="create-name"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        コスメセットの名前
                      </label>
                      <input
                        id="create-name"
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="例：愛用コスメ"
                        className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-card-foreground placeholder-muted-foreground transition-colors focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="create-slug"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        あなた専用のURL
                      </label>
                      <p className="mb-2 text-xs text-muted-foreground">
                        英数字・ハイフン・アンダースコアで入力
                      </p>
                      <div className="flex overflow-hidden rounded-xl border-2 border-input bg-white transition-all focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
                        <span className="flex items-center pl-4 text-sm font-medium text-muted-foreground shrink-0">
                          {typeof window !== "undefined" &&
                          window.location?.origin
                            ? `${new URL(window.location.origin).host}/p/`
                            : "cosmepik.com/p/"}
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
                          placeholder="あなたのID"
                          className="min-w-0 flex-1 px-3 py-3 text-sm text-card-foreground placeholder-muted-foreground focus:outline-none"
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
                        className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 py-3 text-sm font-semibold text-white shadow-sm shadow-rose-200/50 transition-all hover:opacity-90 disabled:opacity-50"
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
      </div>
    </main>
  );
}
