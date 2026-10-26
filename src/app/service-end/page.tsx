import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SERVICE_END_ANNOUNCED_LABEL, SERVICE_END_DATE_LABEL } from "@/lib/service-end";

export const metadata: Metadata = {
  title: "サービス終了のお知らせ",
  description: `cosmepik は ${SERVICE_END_DATE_LABEL} をもってサービスを終了します。`,
  alternates: { canonical: "/service-end" },
};

export default function ServiceEndPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">サービス終了のお知らせ</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          掲載日：{SERVICE_END_ANNOUNCED_LABEL}
        </p>

        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm text-sm text-foreground">
          <p className="leading-relaxed text-muted-foreground">
            いつも cosmepik をご利用いただき、誠にありがとうございます。
            このたび、運営上の理由により、利用規約第8条に基づき {SERVICE_END_DATE_LABEL} をもって本サービスの提供を終了することといたしました。
            これまでご利用いただいた皆さまに、心より御礼申し上げます。
          </p>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. スケジュール</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">{SERVICE_END_ANNOUNCED_LABEL}</strong>
                ：新規登録およびプレミアムプランの新規申し込みを停止
              </li>
              <li>
                <strong className="text-foreground">{SERVICE_END_DATE_LABEL}</strong>
                ：サービス終了（公開ページの表示・ログイン・編集をすべて停止）
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. 登録データの取り扱い</h2>
            <p className="leading-relaxed text-muted-foreground">
              サービス終了後、アカウント情報・プロフィール・アップロード画像・コスメリスト・メイクレシピ等の登録データは、
              プライバシーポリシーに従い速やかに削除し、復元することはできません。
              必要なメイクレシピは、終了日までに編集画面の画像保存機能で保存してください。
              なお、決済に関する記録など、法令により保存が義務づけられている情報は、所定の期間保管したのち削除します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. プレミアムプランをご契約中の方</h2>
            <p className="leading-relaxed text-muted-foreground">
              自動更新を停止し、次回更新日以降の請求は行いません。お支払い済みの期間が終了日を超える場合は、超過分を日割りで返金いたします。
              個別にご案内が必要な場合は、ご登録のメールアドレス宛にご連絡します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. 公開ページのリンクについて</h2>
            <p className="leading-relaxed text-muted-foreground">
              終了日以降、公開ページ（cosmepik.me/ユーザー名）はサービス終了のご案内に切り替わります。
              SNSのプロフィール等にリンクを掲載している場合は、お手数ですが差し替えをお願いいたします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. お問い合わせ</h2>
            <p className="leading-relaxed text-muted-foreground">
              本件に関するお問い合わせは{" "}
              <a href="mailto:info@cosmepik.me" className="font-medium text-green hover:underline">info@cosmepik.me</a>
              {" "}までご連絡ください。
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            cosmepik運営者
          </p>
        </div>

        <p className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:underline">利用規約</Link>
          <Link href="/privacy" className="text-muted-foreground hover:underline">プライバシーポリシー</Link>
          <Link href="/tokushoho" className="text-muted-foreground hover:underline">特定商取引法に基づく表記</Link>
        </p>
      </div>
    </main>
  );
}
