import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

const FAQ_ITEMS = [
  { q: "無料で使えますか？", a: "はい。基本的な機能は無料でご利用いただけます。" },
  { q: "確認メールが届きません", a: "迷惑メールフォルダをご確認ください。届かない場合は、Supabaseのメールテンプレート設定をご確認ください。" },
  { q: "公開ページのURLは？", a: "https://あなたのサイト/p/ユーザーID の形式です。ダッシュボードの「プレビュー」から確認できます。" },
  { q: "楽天の商品は検索できますか？", a: "はい。楽天APIを設定すると商品検索が可能です。未設定時はダミーデータで動作確認できます。" },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
        <Link href="/register" className="rounded-lg bg-green py-2 px-4 text-sm font-medium text-white hover:opacity-90">新規登録</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">よくある質問</h1>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-semibold text-foreground">Q. {item.q}</h2>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-12">
          <Link href="/contact" className="font-medium text-green hover:underline">お問い合わせはこちら →</Link>
        </p>
      </div>
    </main>
  );
}
