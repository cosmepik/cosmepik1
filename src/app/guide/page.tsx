import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function GuidePage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
        <Link href="/register" className="rounded-lg bg-green py-2 px-4 text-sm font-medium text-green-foreground hover:opacity-90">新規登録</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">使い方ガイド</h1>
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">1. 新規登録</h2>
            <p>トップページから「新規登録」をクリックし、メールアドレスとパスワードを設定してください。確認メールが届いたら、リンクをクリックして本登録を完了します。</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">2. プロフィール設定</h2>
            <p>ログイン後、ダッシュボードで表示名やアバター、肌質・パーソナルカラーなどを設定できます。公開ページに表示されます。</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">3. コスメを追加</h2>
            <p>「編集画面」から「コスメを追加」をクリック。検索窓で商品名・ブランド名を検索し、リストに追加します。コメントも自由に付けられます。</p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">4. 公開リンクをシェア</h2>
            <p>「プレビュー」で公開ページを確認し、URLをコピーしてSNSやブログでシェアしましょう。ファンがあなたの愛用コスメを一覧できます。</p>
          </section>
        </div>
        <p className="mt-12">
          <Link href="/register" className="font-medium text-green hover:underline">無料で始める →</Link>
        </p>
      </div>
    </main>
  );
}
