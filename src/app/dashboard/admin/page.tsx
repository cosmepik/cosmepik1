"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { uploadImage } from "@/lib/storage";
import {
  Eye, MousePointerClick, Users, ExternalLink, ArrowUpDown, Search,
  FileText, Plus, Pencil, Trash2, Check, X, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ───────────────── Types ───────────────── */

interface UserRow {
  id: string;
  userId: string;
  name: string;
  slug: string;
  mode: string;
  views: number;
  clicks: number;
  createdAt: string;
}

interface Summary {
  totalViews: number;
  totalClicks: number;
  totalUsers: number;
  activeUsers: number;
}

interface BlogPost {
  id: string;
  title: string;
  body: string;
  thumbnail_url: string | null;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

type SortKey = "views" | "clicks" | "createdAt" | "slug";
type Tab = "users" | "blog";

const CATEGORIES = ["特集", "ビューティー", "スキンケア", "レシピ", "コスメ", "連載", "収益化", "使い方", "新機能"];

/* ───────────────── Component ───────────────── */

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");

  /* ── Users state ── */
  const [users, setUsers] = useState<UserRow[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalViews: 0, totalClicks: 0, totalUsers: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);

  /* ── Blog state ── */
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategory, setFormCategory] = useState("特集");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formPublished, setFormPublished] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback((text: string) => {
    const ta = bodyTextareaRef.current;
    if (!ta) { setFormBody((prev) => prev + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = formBody.slice(0, start);
    const after = formBody.slice(end);
    const needsNewline = before.length > 0 && !before.endsWith("\n");
    const insert = (needsNewline ? "\n" : "") + text;
    setFormBody(before + insert + after);
    requestAnimationFrame(() => {
      const pos = start + insert.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  }, [formBody]);

  const handleBodyImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setBodyImageUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl, "blog", `body-${Date.now()}`);
      insertAtCursor(`![image](${url})`);
    } catch {
      alert("画像のアップロードに失敗しました");
    } finally {
      setBodyImageUploading(false);
    }
  }, [insertAtCursor]);

  /* ── Fetch users ── */
  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (res) => {
        if (res.status === 401) { router.push("/login"); return; }
        if (res.status === 403) { router.push("/dashboard"); return; }
        const data = await res.json();
        if (data.error) { setError(data.error); }
        else {
          setUsers(data.users ?? []);
          setSummary(data.summary ?? { totalViews: 0, totalClicks: 0, totalUsers: 0, activeUsers: 0 });
        }
      })
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [router]);

  /* ── Fetch blog posts ── */
  const fetchPosts = useCallback(() => {
    setBlogLoading(true);
    fetch("/api/admin/blog?all=1")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => {})
      .finally(() => setBlogLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "blog" && posts.length === 0) fetchPosts();
  }, [tab, posts.length, fetchPosts]);

  /* ── Users helpers ── */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users;
    if (q) list = list.filter((u) => u.slug.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [users, search, sortKey, sortAsc]);

  /* ── Blog helpers ── */
  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormTitle("");
    setFormBody("");
    setFormCategory("特集");
    setFormThumbnail("");
    setFormPublished(false);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormBody(post.body);
    setFormCategory(post.category);
    setFormThumbnail(post.thumbnail_url ?? "");
    setFormPublished(post.published);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setFormSaving(true);
    try {
      const payload = {
        title: formTitle,
        body: formBody,
        category: formCategory,
        thumbnailUrl: formThumbnail || null,
        published: formPublished,
        ...(editingPost ? { id: editingPost.id } : {}),
      };
      const res = await fetch("/api/admin/blog", {
        method: editingPost ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { resetForm(); fetchPosts(); }
    } catch {} finally { setFormSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この記事を削除しますか？")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    setThumbnailUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await uploadImage(dataUrl, "blog", `thumb-${Date.now()}`);
      setFormThumbnail(url);
    } catch {
      alert("画像のアップロードに失敗しました");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, published: !post.published }),
    });
    fetchPosts();
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ダッシュボード
        </Link>
      </AppHeader>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-xl font-bold text-foreground">管理者ダッシュボード</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "users" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="h-4 w-4" />
            ユーザー
          </button>
          <button
            type="button"
            onClick={() => setTab("blog")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "blog" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="h-4 w-4" />
            ブログ
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/30 border-t-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">{error}</div>
        ) : tab === "users" ? (
          /* ═══════ Users Tab ═══════ */
          <>
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">ユーザー数</p>
                  <p className="text-lg font-bold text-foreground">{summary.activeUsers}</p>
                  <p className="text-[10px] text-muted-foreground">累計 {summary.totalUsers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500"><Eye className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">合計閲覧数</p><p className="text-lg font-bold text-foreground">{summary.totalViews.toLocaleString()}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><MousePointerClick className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">合計クリック</p><p className="text-lg font-bold text-foreground">{summary.totalClicks.toLocaleString()}</p></div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ユーザー名・レシピ名で検索..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        <button type="button" onClick={() => handleSort("slug")} className="flex items-center gap-1 hover:text-foreground">ユーザー<ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">レシピ名</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">モード</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        <button type="button" onClick={() => handleSort("views")} className="ml-auto flex items-center gap-1 hover:text-foreground">閲覧数<ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        <button type="button" onClick={() => handleSort("clicks")} className="ml-auto flex items-center gap-1 hover:text-foreground">クリック<ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        <button type="button" onClick={() => handleSort("createdAt")} className="ml-auto flex items-center gap-1 hover:text-foreground">作成日<ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">ページ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{search ? "該当するユーザーがいません" : "まだユーザーがいません"}</td></tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-1.5 font-medium text-foreground">{u.slug}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{u.name}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: u.mode === "recipe" ? "#e8729a" : "#9b8ec4" }}>
                            {u.mode === "recipe" ? "レシピ" : "シンプル"}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-medium">{u.views.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums font-medium">{u.clicks.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right text-xs text-muted-foreground tabular-nums">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("ja-JP") : "-"}</td>
                        <td className="px-3 py-1.5 text-center">
                          <a href={`/${u.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/5">
                            <ExternalLink className="h-3 w-3" />見る
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-3 text-right text-xs text-muted-foreground">{filtered.length} 件表示 / 全 {users.length} 件</p>
          </>
        ) : tab === "blog" ? (
          /* ═══════ Blog Tab ═══════ */
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{posts.length} 件の記事</p>
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                新規作成
              </button>
            </div>

            {/* Blog Form */}
            {showForm && (
              <div className="mb-6 rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">{editingPost ? "記事を編集" : "新しい記事を作成"}</h3>
                  <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">タイトル</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="記事タイトル" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">カテゴリ</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">サムネイル画像（任意）</label>
                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                    {formThumbnail ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                          <Image src={formThumbnail} alt="サムネイル" fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => thumbnailInputRef.current?.click()} disabled={thumbnailUploading} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
                            変更
                          </button>
                          <button type="button" onClick={() => setFormThumbnail("")} className="rounded-lg border border-border px-3 py-1.5 text-xs text-rose-500 transition-colors hover:bg-rose-50">
                            削除
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={thumbnailUploading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:opacity-50"
                      >
                        {thumbnailUploading ? (
                          <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> アップロード中...</>
                        ) : (
                          <><ImageIcon className="h-4 w-4" /> 画像を選択</>
                        )}
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">本文</label>
                    <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-muted/30 px-2 py-1.5">
                      <button type="button" onClick={() => insertAtCursor("## ")} className="rounded px-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="大見出し">大見出し</button>
                      <button type="button" onClick={() => insertAtCursor("### ")} className="rounded px-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="小見出し">小見出し</button>
                      <div className="mx-1 h-4 w-px bg-border" />
                      <input ref={bodyImageInputRef} type="file" accept="image/*" onChange={handleBodyImageSelect} className="hidden" />
                      <button type="button" onClick={() => bodyImageInputRef.current?.click()} disabled={bodyImageUploading} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50" title="画像を挿入">
                        {bodyImageUploading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> : <ImageIcon className="h-3.5 w-3.5" />}
                        <span>画像</span>
                      </button>
                    </div>
                    <textarea ref={bodyTextareaRef} value={formBody} onChange={(e) => setFormBody(e.target.value)} rows={10} className="w-full rounded-b-lg rounded-t-none border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder={"記事の本文を入力...\n\n## 大見出し\n### 小見出し\nhttps://... でリンク化\nhttps://cosmepik.me/username でプロフィールカード"} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="published" checked={formPublished} onChange={(e) => setFormPublished(e.target.checked)} className="h-4 w-4 rounded border-border text-primary" />
                    <label htmlFor="published" className="text-sm text-foreground">公開する</label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50">キャンセル</button>
                    <button type="button" onClick={handleSave} disabled={formSaving || !formTitle.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                      {formSaving ? "保存中..." : editingPost ? "更新" : "作成"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Posts List */}
            {blogLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">
                まだ記事がありません
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-colors hover:bg-muted/20">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white shrink-0"
                          style={{ background: post.published ? "#4ab894" : "#aaa" }}
                        >
                          {post.published ? "公開" : "下書き"}
                        </span>
                        <span className="inline-block rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                          {post.category}
                        </span>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => handleTogglePublish(post)} title={post.published ? "非公開にする" : "公開する"} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                        {post.published ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => openEdit(post)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDelete(post.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <a href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
