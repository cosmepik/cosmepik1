"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import { getCosmeSets, getProfile, setProfile } from "@/lib/store";

/** 収益化ページ：楽天アフィリエイトID設定（全コスメセットに一括適用） */
export default function RevenuePage() {
  const { user } = useUser();
  const userId = user?.id ?? "demo";

  const [loading, setLoading] = useState(true);
  const [hasSets, setHasSets] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rakutenAffiliateId, setRakutenAffiliateId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    getCosmeSets(userId)
      .then(async (data) => {
        const list = data ?? [];
        setHasSets(list.length > 0);
        if (list.length > 0) {
          const first = await getProfile(list[0]!.slug);
          setRakutenAffiliateId(first?.rakutenAffiliateId ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    const sets = await getCosmeSets(userId);
    const list = sets ?? [];
    if (list.length === 0) {
      alert("コスメセットがありません。まずダッシュボードでコスメリンクを作成してください。");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const idToSave = rakutenAffiliateId.trim() || undefined;

      for (const s of list) {
        const profile = await getProfile(s.slug);
        await setProfile({
          ...(profile ?? {}),
          username: s.slug,
          rakutenAffiliateId: idToSave,
        });
      }
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
                  楽天アフィリエイトに登録済みの場合、IDを入力すると収益の一部が還元されます。設定はすべてのコスメセットに適用されます。
                </p>
                <Link
                  href="/guide/rakuten-affiliate"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  楽天アフィリエイトの登録方法を見る →
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasSets}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "保存中..." : saved ? "保存しました！" : "保存"}
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
              コスメセットがまだない場合は、<Link href="/dashboard" className="font-medium text-primary hover:underline">ダッシュボード</Link>でコスメリンクを作成してください。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
