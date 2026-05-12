"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, DollarSign } from "lucide-react";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LectureVideo } from "@/components/LectureVideo";
import { useUser } from "@/hooks/use-user";
import { getCosmeSets, getProfile, setProfile } from "@/lib/store";

/** 収益化ページ：楽天アフィリエイトID設定（全メイクレシピに一括適用） */
export default function RevenuePage() {
  const { user, loading: userLoading } = useUser();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [hasSets, setHasSets] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rakutenAffiliateId, setRakutenAffiliateId] = useState("");
  const [originalId, setOriginalId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanged = rakutenAffiliateId.trim() !== originalId;

  const load = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    getCosmeSets(userId)
      .then(async (data) => {
        const list = data ?? [];
        setHasSets(list.length > 0);
        if (list.length > 0) {
          const slug = list[0]!.slug;
          const res = await fetch(`/api/profile/${encodeURIComponent(slug)}`, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            const id = json.profile?.rakutenAffiliateId ?? json.profile?.rakuten_affiliate_id ?? "";
            setRakutenAffiliateId(id);
            setOriginalId(id);
          } else {
            const first = await getProfile(slug);
            const id = first?.rakutenAffiliateId ?? "";
            setRakutenAffiliateId(id);
            setOriginalId(id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userLoading) load();
  }, [userLoading, load]);

  const handleSave = async () => {
    if (!userId) return;
    const sets = await getCosmeSets(userId);
    const list = sets ?? [];
    if (list.length === 0) {
      alert("メイクレシピがありません。まずダッシュボードでコスメリンクを作成してください。");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const idToSave = rakutenAffiliateId.trim() || null;

      for (const s of list) {
        const profile = await getProfile(s.slug);
        await setProfile({
          ...(profile ?? {}),
          username: s.slug,
          rakutenAffiliateId: idToSave ?? undefined,
        });
      }
      setOriginalId(rakutenAffiliateId.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[RevenuePage] 保存失敗:", err);
      alert(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← ダッシュボード
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
          <DollarSign className="h-6 w-6 text-primary" aria-hidden />
          収益化
        </h1>

        <div className="mb-6">
          <LectureVideo
            youtubeId="7BbxqflHF64"
            title="cosmepikで収益化する方法"
            orientation="vertical"
          />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            動画で見る：cosmepikでの収益化の流れ
          </p>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          楽天アフィリエイトIDを設定すると、コスメリンクに掲載した商品の購入時に収益の一部が還元されます。
        </p>

        {loading ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            読み込み中...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-card-foreground">
                楽天アフィリエイト
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  楽天アフィリエイトID
                </label>
                <input
                  type="text"
                  value={rakutenAffiliateId}
                  onChange={(e) => setRakutenAffiliateId(e.target.value)}
                  placeholder="0ea12345.ab.cd（任意）"
                  className="rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  楽天アフィリエイトに登録済みの場合、IDを入力すると収益の一部が還元されます。設定はすべてのメイクレシピに適用されます。
                </p>
                <Link
                  href="/guide/rakuten-affiliate"
                  className="group mt-3 flex w-full items-center gap-3 rounded-xl border-2 border-primary/35 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-3.5 text-left shadow-sm ring-1 ring-primary/15 transition-all hover:border-primary/55 hover:from-primary/15 hover:shadow-md active:scale-[0.995]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary shadow-sm ring-1 ring-primary/10 group-hover:bg-white">
                    <BookOpen className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">
                      楽天アフィリエイトの登録方法を見る
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      はじめての方でもわかりやすい手順ガイド
                    </span>
                  </span>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasSets || !hasChanged}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
              {saved && (
                <span className="text-sm text-green-600">保存しました</span>
              )}
            </div>
          </div>
        )}

        {!loading && !hasSets && (
          <div className="mt-8 rounded-xl border border-border bg-muted/30 px-4 py-4">
            <p className="text-xs text-muted-foreground">
              メイクレシピがまだない場合は、<Link href="/dashboard" className="font-medium text-primary hover:underline">ダッシュボード</Link>でコスメリンクを作成してください。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
