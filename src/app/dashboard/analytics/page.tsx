"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Eye, TrendingUp, BarChart3, ExternalLink, ArrowUpRight } from "lucide-react";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";
import { getCosmeSets } from "@/lib/store";
import type { CosmeSet } from "@/types";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useUser();
  const userId = user?.id ?? "demo";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [bySlug, setBySlug] = useState<Record<string, number>>({});
  const [sets, setSets] = useState<CosmeSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    Promise.all([
      fetch("/api/analytics/views")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            if (typeof data.total === "number") setTotalViews(data.total);
            if (data.bySlug) setBySlug(data.bySlug);
          }
        })
        .catch(() => {}),
      getCosmeSets(userId)
        .then((data) => setSets(data ?? []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [authLoading, userId]);

  const maxViews = useMemo(
    () => Math.max(1, ...Object.values(bySlug)),
    [bySlug]
  );

  const slugEntries = useMemo(() => {
    const nameMap = new Map(sets.map((s) => [s.slug, s.name]));
    return Object.entries(bySlug)
      .map(([slug, count]) => ({
        slug,
        name: nameMap.get(slug) ?? slug,
        count,
        pct: Math.round((count / maxViews) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [bySlug, sets, maxViews]);

  const total = totalViews ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← ダッシュボード
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        {/* Page Title */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green/10">
            <BarChart3 className="h-5 w-5 text-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              アクセス解析
            </h1>
            <p className="text-xs text-muted-foreground">
              公開ページのパフォーマンス
            </p>
          </div>
        </div>

        {loading || authLoading ? (
          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-2xl bg-muted/60" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted/30" />
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green via-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-green/20">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

              <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    トータルビュー
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {total.toLocaleString()}
                  </span>
                  <span className="mb-1.5 text-lg font-medium text-white/70">
                    views
                  </span>
                </div>

                <p className="mt-3 text-xs text-white/60">
                  すべてのメイクレシピの公開ページ（/p/◯◯）へのアクセス合計
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {slugEntries.length}
                </p>
                <p className="text-xs text-muted-foreground">アクティブページ</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <ArrowUpRight className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {slugEntries.length > 0
                    ? Math.round(total / slugEntries.length).toLocaleString()
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">平均ビュー / ページ</p>
              </div>
            </div>

            {/* Per-slug Breakdown */}
            <div className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                ページ別アクセス
              </h2>

              {slugEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Eye className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    まだデータがありません
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    メイクレシピを公開するとアクセス数がここに表示されます
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slugEntries.map((entry, i) => (
                    <div
                      key={entry.slug}
                      className="group relative overflow-hidden rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{
                              background:
                                i === 0
                                  ? "linear-gradient(135deg, #10b981, #059669)"
                                  : i === 1
                                  ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                                  : "linear-gradient(135deg, #6b7280, #4b5563)",
                            }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {entry.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              /p/{entry.slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            {entry.count.toLocaleString()}
                          </span>
                          <Link
                            href={`/${entry.slug}`}
                            target="_blank"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${entry.pct}%`,
                            background:
                              i === 0
                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                : i === 1
                                ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                                : "linear-gradient(90deg, #6b7280, #9ca3af)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
