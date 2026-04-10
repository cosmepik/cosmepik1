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
          最終更新日：2026年4月
        </p>

        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm text-sm text-foreground">
          <p className="leading-relaxed text-muted-foreground">
            cosmepik運営者（以下「運営者」といいます。）は、運営者が提供するサービス「cosmepik」（以下「本サービス」といい、本サービスの利用者を「ユーザー」といいます。）の提供に関し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>

          {/* 1. ユーザーデータの取得 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">1. ユーザーデータの取得</h2>
            <p className="mb-3 leading-relaxed text-muted-foreground">
              運営者は、ユーザーによる本サービスの利用に際して、次に定める情報その他のユーザーに関連する情報（以下「ユーザーデータ」といいます。）を取得することがあります。
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">認証情報</strong>
                <br />メールアドレス、パスワード（暗号化して保管）、またはGoogle・X（旧Twitter）・LINE等のソーシャルログインに紐づく識別子・表示名・プロフィール画像URL
              </li>
              <li>
                <strong className="text-foreground">プロフィール情報</strong>
                <br />表示名、自己紹介文、肌質・パーソナルカラー、SNSリンク、楽天アフィリエイトID
              </li>
              <li>
                <strong className="text-foreground">画像データ</strong>
                <br />ユーザーがアップロードしたプロフィールアイコン画像、メイクレシピ用の顔写真・背景画像、壁紙画像、コスメアイテム画像
              </li>
              <li>
                <strong className="text-foreground">コンテンツ情報</strong>
                <br />愛用コスメのリスト（商品名・ブランド・カテゴリ・コメント・購入リンク等）、メイクレシピの配置データ、セクション構成、ページデザイン設定
              </li>
              <li>
                <strong className="text-foreground">アクセス・利用状況</strong>
                <br />ページ閲覧数、アフィリエイトリンクのクリック履歴（ユーザー名・商品URL・クリック日時）
              </li>
              <li>
                <strong className="text-foreground">決済情報</strong>
                <br />有料プランをご利用の場合、Stripe経由で取得する顧客ID・サブスクリプションID・決済ステータス（クレジットカード番号等はStripeが管理し、運営者は直接保持しません）
              </li>
              <li>
                <strong className="text-foreground">技術情報</strong>
                <br />IPアドレス、ブラウザ種類、端末情報、アクセス日時、Cookie等
              </li>
              <li>
                <strong className="text-foreground">お問い合わせ内容</strong>
                <br />お問い合わせフォームまたはメールでいただいた内容および連絡先
              </li>
            </ol>
          </section>

          {/* 2. ユーザーデータの利用目的 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">2. ユーザーデータの利用目的</h2>
            <p className="mb-3 leading-relaxed text-muted-foreground">
              運営者は、ユーザーデータを適法かつ適正な手段により取得し、次の利用目的の達成に必要な範囲内で適正に利用いたします。
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
              <li>本サービスの各種機能の提供・運営（アカウント認証、プロフィール・コスメリスト・メイクレシピの表示・保存・公開）</li>
              <li>ログイン状態の維持（セッション・Cookieの利用）</li>
              <li>お問い合わせ、ご相談、ご意見に対するご回答その他のユーザーとの連絡</li>
              <li>ユーザーの本人確認および本サービスをご利用いただく資格等の確認</li>
              <li>本サービスの改善、新機能の開発、不具合対応、セキュリティ対策</li>
              <li>アクセス解析・利用状況の統計的な分析</li>
              <li>アフィリエイト報酬の集計および管理</li>
              <li>広告配信および広告効果の測定</li>
              <li>有料プランの決済処理および契約管理</li>
              <li>規約違反などの不正行為の調査および対応</li>
              <li>法令等に基づく対応</li>
            </ol>
          </section>

          {/* 3. 管理者によるアクセス */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">3. 管理者によるアクセス</h2>
            <p className="leading-relaxed text-muted-foreground">
              運営者は、本サービスの運営・管理・改善・不正行為への対応、およびユーザーサポートの目的で、管理画面を通じてユーザーデータ（プロフィール情報、アップロードされた画像、コスメリスト、閲覧数・クリック数等の利用状況）にアクセスすることがあります。管理画面へのアクセスは、運営者が指定した管理者アカウントに限定されており、上記目的以外の利用は行いません。
            </p>
          </section>

          {/* 4. 第三者提供の制限 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">4. 第三者提供の制限</h2>
            <p className="leading-relaxed text-muted-foreground">
              運営者は、法令により例外として扱うことが認められている場合を除き、ユーザーの同意なく、個人情報を第三者に提供することはいたしません。ただし、本サービスの提供にあたり、以下の外部サービスにデータが送信される場合があります。
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Supabase</strong>：認証情報・データベース・画像ストレージの管理</li>
              <li><strong className="text-foreground">楽天</strong>：コスメ商品の検索に際し、ユーザーが入力した検索キーワードが楽天APIに送信されます</li>
              <li><strong className="text-foreground">LINE</strong>：LINEログインを利用する場合、LINE社のOAuth認可サーバーおよびプロフィールAPIを通じて認証が行われます</li>
              <li><strong className="text-foreground">Stripe</strong>：有料プランの決済処理に利用されます</li>
              <li><strong className="text-foreground">Google</strong>：Google Analyticsによるアクセス解析およびGoogle AdSenseによる広告配信に利用されます</li>
            </ul>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              各外部サービスにおけるデータの取扱いについては、それぞれのプライバシーポリシーが適用されます。
            </p>
          </section>

          {/* 5. ユーザーデータの外部送信 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">5. ユーザーデータの外部送信</h2>
            <p className="mb-3 leading-relaxed text-muted-foreground">
              運営者は、本サービスの提供に伴い、アクセス解析および広告配信の目的により、Cookieをはじめとしたタグや情報収集モジュールを用いて、ユーザー情報の外部送信を行うことがあります。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-semibold text-foreground">事業者名</th>
                    <th className="py-2 pr-3 text-left font-semibold text-foreground">サービス名</th>
                    <th className="py-2 pr-3 text-left font-semibold text-foreground">送信される情報</th>
                    <th className="py-2 text-left font-semibold text-foreground">利用目的</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-3">Google LLC</td>
                    <td className="py-2 pr-3">Google Analytics</td>
                    <td className="py-2 pr-3">閲覧ページ、アクセス日時、端末・ブラウザ情報、Cookie</td>
                    <td className="py-2">アクセス解析・サービス改善</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-3">Google LLC</td>
                    <td className="py-2 pr-3">Google AdSense</td>
                    <td className="py-2 pr-3">閲覧ページ、Cookie、広告表示に関する情報</td>
                    <td className="py-2">広告配信・広告効果測定</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Cookieの利用 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">6. Cookieの利用</h2>
            <p className="leading-relaxed text-muted-foreground">
              本サービスでは、ログイン状態の維持、利便性の向上、アクセス解析および広告配信のためにCookieを使用することがあります。ブラウザの設定でCookieを無効にすることも可能ですが、その場合、ログイン機能を含む一部の機能が利用できなくなる場合があります。
            </p>
          </section>

          {/* 7. ユーザー情報の管理 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">7. ユーザー情報の管理</h2>
            <p className="leading-relaxed text-muted-foreground">
              運営者は、個人データの漏えい、減失または毀損の防止その他の個人データの安全管理のために必要かつ適切な安全管理措置を講じます。ユーザーデータは、本サービスの提供に必要な期間、適切に保管します。
            </p>
          </section>

          {/* 8. データの開示・訂正・削除 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">8. データの開示・訂正・削除</h2>
            <p className="leading-relaxed text-muted-foreground">
              ユーザーは、本サービスの設定画面からプロフィール情報の編集、画像の変更・削除を行うことができます。アカウントの削除を希望する場合は、本サービス内の退会機能またはお問い合わせ窓口よりご連絡ください。退会した場合、法令で保存が義務づけられている場合を除き、ユーザーのアカウントおよびデータは合理的な範囲で速やかに削除いたします。
            </p>
          </section>

          {/* 9. 同意 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">9. 同意</h2>
            <p className="leading-relaxed text-muted-foreground">
              ユーザーは、本サービスの利用登録を完了した時点で、本ポリシーおよび<Link href="/terms" className="font-medium text-green hover:underline">利用規約</Link>の内容に同意したものとみなされます。同意いただけない場合は、本サービスのご利用をお控えください。
            </p>
          </section>

          {/* 10. お子様の利用 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">10. お子様の利用</h2>
            <p className="leading-relaxed text-muted-foreground">
              本サービスは、主に一般の方を対象としています。未成年の方がご利用になる場合は、保護者の同意のうえでご利用ください。
            </p>
          </section>

          {/* 11. ポリシーの変更 */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">11. ポリシーの変更</h2>
            <p className="leading-relaxed text-muted-foreground">
              運営者は、法令の制定や改正等の理由により、本ポリシーを随時変更する場合があり、変更した場合には、本ページの更新日を改め、可能な範囲でお知らせします。変更後も本サービスの利用を継続した場合、ユーザーは変更後のポリシーに同意したものとみなされます。
            </p>
          </section>

          {/* 12. お問い合わせ */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">12. お問い合わせ</h2>
            <p className="leading-relaxed text-muted-foreground">
              個人情報の取り扱いに関するご質問・ご要望は、<Link href="/contact" className="font-medium text-green hover:underline">お問い合わせページ</Link>または <a href="mailto:info@cosmepik.me" className="font-medium text-green hover:underline">info@cosmepik.me</a> までご連絡ください。
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            2026年4月 改定
          </p>
        </div>

        <p className="mt-8">
          <Link href="/" className="font-medium text-green hover:underline">← トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
