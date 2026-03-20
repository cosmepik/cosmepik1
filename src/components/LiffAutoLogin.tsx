"use client";

import { useLiff } from "@/hooks/use-liff";

/**
 * LIFF（LINE 内ブラウザ）からアクセスした場合に
 * 自動ログインのローディング画面を表示する。
 * ログイン完了後は通常の編集画面が表示される。
 */
export function LiffAutoLogin({ children }: { children: React.ReactNode }) {
  const { isInLiff, ready, loggingIn, error } = useLiff();

  if (!isInLiff) return <>{children}</>;

  if (!ready || loggingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">LINEからログイン中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">ログインに失敗しました</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
