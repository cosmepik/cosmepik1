"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";

/** アクセス解析：UIBASE 完全準拠 */
export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/views")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.total === "number") {
          setTotalViews(data.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">アクセス解析</h1>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">あなたのページの閲覧数（合計）</p>
          {loading ? (
            <p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
          ) : (
            <p className="mt-1 text-3xl font-bold text-foreground">
              {(totalViews ?? 0).toLocaleString()} 回
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            すべてのコスメセットの公開ページ（/p/◯◯）へのアクセス合計です。
          </p>
        </div>

        <p className="mt-6">
          <Link href="/dashboard" className="font-medium text-green hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </p>
      </div>
    </main>
  );
}
