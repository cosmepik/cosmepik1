import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
      </AppHeader>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">お問い合わせ</h1>
        <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-muted-foreground">
            ご質問・ご要望がありましたら、以下のメールアドレスまでお送りください。
          </p>
          <a href="mailto:info@cosmepik.me" className="font-medium text-green hover:underline">info@cosmepik.me</a>
          <p className="text-sm text-muted-foreground">
            ※ 返信までお時間をいただく場合がございます。
          </p>
        </div>
        <p className="mt-8">
          <Link href="/" className="font-medium text-green hover:underline">← トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
