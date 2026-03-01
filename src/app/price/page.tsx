import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function PricePage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
        <Link href="/register" className="rounded-lg bg-green py-2 px-4 text-sm font-medium text-white hover:opacity-90">新規登録</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">料金プラン</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border-2 border-border bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-foreground">無料プラン</h2>
            <p className="mb-4 text-2xl font-bold text-foreground">¥0<span className="text-sm font-normal text-muted-foreground">/月</span></p>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ 愛用コスメリスト</li>
              <li>✓ 公開ページ 1 件</li>
              <li>✓ プロフィール編集</li>
              <li>✓ 楽天検索（要設定）</li>
            </ul>
            <Link href="/register" className="block rounded-lg border-2 border-green/50 py-3 text-center font-medium text-green transition-colors hover:bg-accent">
              無料で始める
            </Link>
          </div>
          <div className="relative rounded-xl border-2 border-border bg-white p-6 shadow-sm">
            <span className="absolute -top-2 right-4 rounded-full bg-green px-2 py-0.5 text-xs text-white">準備中</span>
            <h2 className="mb-2 text-lg font-semibold text-foreground">プレミアム</h2>
            <p className="mb-4 text-2xl font-bold text-foreground">coming soon</p>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li>✓ 無料プランの全機能</li>
              <li>✓ カスタムドメイン</li>
              <li>✓ アクセス解析</li>
              <li>✓ 広告非表示</li>
            </ul>
            <button disabled className="block w-full cursor-not-allowed rounded-lg bg-muted py-3 text-center font-medium text-muted-foreground">
              近日公開
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
