"use client";

import Link from "next/link";

/** アクセス解析：UIBASE 完全準拠 */
export default function AnalyticsPage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">cosmepik</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← ダッシュボード</Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">アクセス解析</h1>
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-muted-foreground">公開ページの閲覧数など、アクセス解析機能は準備中です。</p>
          <p className="text-sm text-muted-foreground">プレミアムプランでご提供予定です。</p>
        </div>
        <p className="mt-6">
          <Link href="/dashboard" className="font-medium text-green hover:underline">← ダッシュボードに戻る</Link>
        </p>
      </div>
    </main>
  );
}
