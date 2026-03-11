"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Copy } from "lucide-react";
import { toast } from "sonner";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import { getCosmeSets, createCosmeSet, deleteCosmeSet, updateCosmeSetName } from "@/lib/store";
import type { CosmeSet } from "@/types";

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

/** URL用スラッグを正規化（小文字・英数字・ハイフン・アンダースコアのみ） */
function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

/** ホーム画面：UIBASE 完全準拠 */
export default function DashboardHomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const userId = user?.id ?? "demo";
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [sets, setSets] = useState<CosmeSet[]>([]);
  const [loading, setLoading] = useState(true);
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
      .then((data) => {
        setSets(data ?? []);
      })
      .catch(() => {
        setSets([]);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading]);

  const handleDeleteSet = useCallback(
    async (set: CosmeSet) => {
      setOpenMenuSetId(null);
      if (!confirm(`「${set.name}」を削除しますか？この操作は取り消せません。`)) return;
      const ok = await deleteCosmeSet(userId, set.slug);
      if (ok) load();
    },
    [userId, load]
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
    const exists = sets.some((s) => s.slug === slug);
    if (exists) {
      setCreateFormError("このURLは既に使用されています");
      return;
    }
    setCreating(true);
    try {
      const timeoutMs = 8000;
      const createPromise = createCosmeSet(userId, name, slug);
      const timeoutPromise = new Promise<CosmeSet | null>((_, reject) =>
        setTimeout(() => reject(new Error("タイムアウトしました")), timeoutMs)
      );
      const newSet = await Promise.race([createPromise, timeoutPromise]);
      if (newSet) {
        setCreateModalOpen(false);
        router.push(`/dashboard/edit/${newSet.slug}`);
      } else {
        setCreateFormError("作成に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      setCreateFormError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenuSetId, setOpenMenuSetId] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<CosmeSet | null>(null);
  const [editingName, setEditingName] = useState("");
  const [generatingCodeFor, setGeneratingCodeFor] = useState<string | null>(null);
  const [inviteCodesBySlug, setInviteCodesBySlug] = useState<Record<string, { claim_code: string; is_claimed: boolean }>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin || sets.length === 0) return;
    fetch("/api/invite/codes")
      .then((res) => res.json())
      .then((data) => {
        const bySlug: Record<string, { claim_code: string; is_claimed: boolean }> = {};
        for (const c of data.codes ?? []) {
          if (c.slug) bySlug[c.slug] = { claim_code: c.claim_code, is_claimed: c.is_claimed };
        }
        setInviteCodesBySlug(bySlug);
      })
      .catch(() => {});
  }, [isAdmin, sets.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuSetId(null);
      }
    };
    if (openMenuSetId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuSetId]);

  const handleCopyUrl = useCallback((set: CosmeSet) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/p/${set.slug}` : "";
    if (url) navigator.clipboard.writeText(url);
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
        setInviteCodesBySlug((prev) => ({ ...prev, [set.slug]: { claim_code: code, is_claimed: false } }));
        navigator.clipboard.writeText(code);
        toast.success(`招待コード ${code} をコピーしました`);
      } catch {
        toast.error("コードの生成に失敗しました");
      } finally {
        setGeneratingCodeFor(null);
      }
    },
    []
  );

  return (
    <main className="min-h-screen">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="mx-auto max-w-md px-4 py-8">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">マイコスメセット</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">タップして編集</p>

        {(loading || authLoading) ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">読み込み中...</div>
        ) : (
          <>
            {sets.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                まずはコスメセットを作成して、あなたのコスメリンクを共有しましょう
              </p>
            )}
            <ul className="mt-6 space-y-3">
              {sets.map((set) => (
                <li key={set.id} className="flex items-stretch gap-2">
                  {editingSet?.id === set.id ? (
                    <div className="flex min-w-0 flex-1 items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                      {set.avatarUrl ? (
                        <img src={set.avatarUrl} alt="" className="h-full w-full object-cover object-center" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-green">
                          <path d="M12 2v4" />
                          <path d="M8 6h8" />
                          <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
                          <path d="M6 6h12" />
                        </svg>
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
                        className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-medium text-card-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-0.5 text-sm text-muted-foreground">{set.itemCount ?? 0} 件のコスメ</p>
                    </div>
                    </div>
                  ) : (
                  <Link
                    href={`/dashboard/edit/${set.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                      {set.avatarUrl ? (
                        <img src={set.avatarUrl} alt="" className="h-full w-full object-cover object-center" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-green">
                          <path d="M12 2v4" />
                          <path d="M8 6h8" />
                          <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
                          <path d="M6 6h12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-card-foreground">{set.name}</p>
                      <p className="text-sm text-muted-foreground">{set.itemCount ?? 0} 件のコスメ</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0 text-muted-foreground">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  )}
                  <div className="relative flex shrink-0" ref={openMenuSetId === set.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenuSetId((prev) => (prev === set.id ? null : set.id));
                      }}
                      className="flex items-center justify-center rounded-xl border border-border p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="編集"
                      aria-expanded={openMenuSetId === set.id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    {openMenuSetId === set.id && (
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
                        {isAdmin && inviteCodesBySlug[set.slug] && (
                          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                            <span className="text-xs text-muted-foreground">発行済みコード</span>
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono text-sm font-bold tracking-wider">
                                {inviteCodesBySlug[set.slug].claim_code}
                              </code>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(inviteCodesBySlug[set.slug].claim_code);
                                  toast.success("コピーしました");
                                }}
                                className="rounded p-1 hover:bg-muted"
                                aria-label="コピー"
                              >
                                <Copy className="h-3.5 w-3.5" />
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
                            disabled={generatingCodeFor === set.id || !!inviteCodesBySlug[set.slug]}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                          >
                            <Ticket className="h-4 w-4 shrink-0" />
                            {generatingCodeFor === set.id ? "生成中..." : inviteCodesBySlug[set.slug] ? "招待コード発行済み" : "招待コードを発行"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleStartRename(set);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                          名前を変更
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopyUrl(set);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                          </svg>
                          URLをコピー
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteSet(set);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                          コスメセットを消去
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {createError && (
              <p className="mt-4 text-sm text-destructive">{createError}</p>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-6 w-full rounded-xl border-2 border-dashed border-border py-6 text-muted-foreground transition-colors hover:border-green hover:text-foreground"
            >
              ＋ 新しいコスメセットを作成
            </button>

            {/* #cosmepik編集部 コラム */}
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-bold text-foreground">
                #cosmepik編集部
              </h2>
              <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  いっしょうけんめい準備中！
                </p>
              </div>
            </section>

            {/* 作成モーダル */}
            {createModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-modal-title"
              onClick={() => setCreateModalOpen(false)}
            >
              <div
                className="max-w-md w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-border p-6">
                  <h2 id="create-modal-title" className="text-lg font-medium text-foreground">
                    新しいコスメセットを作成
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    名前とあなた専用のURLを決めましょう
                  </p>
                </div>
                <form onSubmit={handleCreateSet} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="create-name" className="mb-1 block text-sm font-medium text-foreground">
                      名前
                    </label>
                    <input
                      id="create-name"
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="例：愛用コスメ"
                      className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm text-card-foreground placeholder-muted-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      URLを決めましょう😃
                    </p>
                    <p className="mb-2 text-xs text-muted-foreground">
                      あなたのコスメリンクのアドレスです。英数字・ハイフン・アンダースコアで入力
                    </p>
                    <div className="flex rounded-xl border-2 border-input bg-white overflow-hidden focus-within:border-green focus-within:ring-2 focus-within:ring-ring transition-all">
                      <span className="flex items-center pl-4 text-sm text-muted-foreground font-medium shrink-0">
                        {typeof window !== "undefined" && window.location?.origin
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
                          const filtered = value.replace(/[^a-zA-Z0-9\-_]/g, "");
                          if ((e.nativeEvent as InputEvent).isComposing) {
                            setCreateSlug(value);
                            setSlugInputError(null);
                          } else {
                            setCreateSlug(filtered);
                            setSlugInputError(value !== filtered ? "半角英数で入力してください" : null);
                          }
                        }}
                        onCompositionEnd={(e) => {
                          const value = (e.target as HTMLInputElement).value;
                          const filtered = value.replace(/[^a-zA-Z0-9\-_]/g, "");
                          setCreateSlug(filtered);
                          setSlugInputError(value !== filtered ? "半角英数で入力してください" : null);
                        }}
                        placeholder="あなたのID"
                        className="flex-1 min-w-0 py-3 px-3 text-sm text-card-foreground placeholder-muted-foreground focus:outline-none"
                      />
                    </div>
                    {slugInputError && (
                      <p className="mt-1.5 text-sm text-destructive">{slugInputError}</p>
                    )}
                  </div>
                  {createFormError && (
                    <p className="text-sm text-destructive">{createFormError}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 rounded-lg bg-green py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {creating ? "作成中..." : "作成"}
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
