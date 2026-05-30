import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cosmepik.me";

export const metadata: Metadata = {
  title: "お問い合わせ｜cosmepik",
  description:
    "cosmepik（コスメピック）へのご質問・ご要望・不具合のご報告はこちら。メール（info@cosmepik.me）にて承っています。",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "お問い合わせ｜cosmepik",
    description:
      "cosmepikへのご質問・ご要望はメール（info@cosmepik.me）にて承っています。",
    url: `${SITE_URL}/contact`,
    siteName: "cosmepik",
    type: "website",
  },
};

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
