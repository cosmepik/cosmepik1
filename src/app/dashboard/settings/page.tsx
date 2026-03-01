"use client";

import Link from "next/link";

/** アカウント設定：UIBASE 完全準拠 */
export default function SettingsPage() {
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

      <div className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        <h1 className="mb-6 text-xl font-bold text-foreground">アカウント設定</h1>

        <p className="mb-6 text-muted-foreground">
          プロフィール（表示名・アバター・肌質・パーソナルカラーなど）は、編集画面で設定できます。
        </p>
        <Link href="/dashboard" className="inline-block rounded-lg bg-green py-3 px-6 font-medium text-green-foreground hover:opacity-90">
          編集画面へ
        </Link>
      </div>
    </main>
  );
}
