import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">プライバシーポリシー</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          最終更新日：2026年2月
        </p>

        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm text-sm text-foreground">
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. はじめに</h2>
            <p className="leading-relaxed text-muted-foreground">
              cosmepik（以下「本サービス」）は、ユーザーの個人情報の保護を大切にしています。本プライバシーポリシーは、本サービスがどのような情報を収集し、どのように利用・保管するかについて説明するものです。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. 収集する情報</h2>
            <p className="mb-2 leading-relaxed text-muted-foreground">本サービスでは、以下の情報を収集・利用することがあります。</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">認証情報</strong>：メールアドレス、パスワード（暗号化して保管）、または Google・X 等のソーシャルログインに紐づく識別子</li>
              <li><strong className="text-foreground">プロフィール情報</strong>：表示名、プロフィール画像、自己紹介文、肌質・パーソナルカラー、SNSリンクなど、ユーザーが入力した内容</li>
              <li><strong className="text-foreground">コンテンツ情報</strong>：愛用コスメのリスト、セクション名、商品メモなど、本サービス上で作成・保存したデータ</li>
              <li><strong className="text-foreground">技術情報</strong>：IPアドレス、ブラウザ種類、アクセス日時、Cookie 等（サービスの提供・改善・不正防止のため）</li>
              <li><strong className="text-foreground">お問い合わせ内容</strong>：お問い合わせフォームまたはメールでいただいた内容および連絡先</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. 利用目的</h2>
            <p className="mb-2 leading-relaxed text-muted-foreground">収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>本サービスの提供・運営（アカウント認証、プロフィール・コスメリストの表示・保存）</li>
              <li>ログイン状態の維持（セッション・Cookie の利用）</li>
              <li>お問い合わせへの対応</li>
              <li>サービス改善・不具合対応・セキュリティ対策</li>
              <li>法令に基づく対応</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. 第三者提供</h2>
            <p className="leading-relaxed text-muted-foreground">
              本サービスは、法令に定める場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。認証・データ保存には Supabase 等の外部サービスを利用しており、それらのプライバシーポリシーが適用されます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. Cookie の利用</h2>
            <p className="leading-relaxed text-muted-foreground">
              本サービスでは、ログイン状態の維持や利便性の向上のために Cookie を使用することがあります。ブラウザの設定で Cookie を無効にすることも可能ですが、その場合、一部の機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">6. データの保管・削除</h2>
            <p className="leading-relaxed text-muted-foreground">
              ユーザーデータは、本サービスの提供に必要な期間、適切に保管します。アカウント削除や削除のご要望があった場合、法令で保存が義務づけられている場合を除き、合理的な範囲で速やかに削除するよう努めます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">7. お子様の利用</h2>
            <p className="leading-relaxed text-muted-foreground">
              本サービスは、主に一般の方を対象としています。未成年の方がご利用になる場合は、保護者の同意のうえでご利用ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">8. ポリシーの変更</h2>
            <p className="leading-relaxed text-muted-foreground">
              本プライバシーポリシーは、必要に応じて改定することがあります。重要な変更がある場合は、本ページの更新日を改め、可能な範囲でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">9. お問い合わせ</h2>
            <p className="leading-relaxed text-muted-foreground">
              個人情報の取り扱いに関するご質問・ご要望は、<Link href="/contact" className="font-medium text-green hover:underline">お問い合わせページ</Link>または <a href="mailto:cosmepik.team@gmail.com" className="font-medium text-green hover:underline">cosmepik.team@gmail.com</a> までご連絡ください。
            </p>
          </section>
        </div>

        <p className="mt-8">
          <Link href="/" className="font-medium text-green hover:underline">← トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
