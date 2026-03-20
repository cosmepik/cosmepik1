import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">利用規約</h1>
        <p className="mb-8 text-sm text-muted-foreground">最終更新日：2026年3月</p>

        <div className="space-y-8 rounded-xl bg-white p-6 shadow-sm text-sm text-foreground">

          <p className="leading-relaxed text-muted-foreground">
            本規約は、cosmepik運営者（以下「運営者」といいます。）が提供するプロフィールリンクサービス「cosmepik」（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスの利用を希望する方は、本規約およびプライバシーポリシーの内容をご確認のうえ、同意いただく必要があります。
          </p>

          {/* 第1章 総則 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第1章 総則</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第1条（適用）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本規約は、本サービスの提供条件および本サービスの利用に関する運営者とユーザーの間の権利義務関係を定めることを目的とし、運営者とユーザーの間の本サービスの利用に関わる一切の関係に適用されます。</li>
                  <li>本規約の内容と本規約外における本サービスに係る説明が矛盾する場合には、本規約の規定が優先して適用されるものとします。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第2条（定義）</h3>
                <p className="mb-2 leading-relaxed text-muted-foreground">本規約における用語の定義は、以下のとおりとします。</p>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>「本サービス」とは、運営者が提供するプロフィールリンクサービス「cosmepik」をいいます。</li>
                  <li>「ユーザー」とは、本規約に同意のうえ、本サービスの利用登録を完了した者をいいます。</li>
                  <li>「投稿コンテンツ」とは、ユーザーが本サービス上にアップロードした文章、画像、データその他一切のコンテンツをいいます。</li>
                  <li>「連携サービス」とは、本サービスと連携する第三者が提供する外部サービス（Google、X、LINE等を含みますがこれに限りません。）をいいます。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第2章 ユーザー登録等 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第2章 ユーザー登録等</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第3条（ユーザー登録）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本サービスの利用を希望する者は、本規約およびプライバシーポリシーに同意し、運営者所定の方法（連携サービスを利用する場合を含みます。）により登録を行うものとします。</li>
                  <li>運営者は、利用希望者が以下のいずれかに該当すると判断した場合、登録を拒否することができます。運営者は拒否の理由を開示する義務を負いません。
                    <ul className="list-disc pl-6 mt-1 space-y-0.5">
                      <li>登録情報に虚偽がある場合</li>
                      <li>過去に本規約に違反したことがある場合</li>
                      <li>反社会的勢力等に該当する場合</li>
                      <li>その他運営者が不適切と判断した場合</li>
                    </ul>
                  </li>
                  <li>ユーザーは、登録情報に変更が生じた場合、速やかに修正するものとします。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第4条（アカウントの管理）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>ユーザーは、自己のアカウント情報（ID、パスワード等）を自らの責任において管理し、第三者に使用させてはなりません。</li>
                  <li>アカウント情報を使用してなされた行為は、すべて当該アカウントのユーザーによる行為とみなします。</li>
                  <li>アカウントの不正利用が判明した場合、ユーザーは速やかに運営者に通知するものとします。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第3章 サービスの利用 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第3章 サービスの利用</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第5条（サービスの内容）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本サービスは、ユーザーが愛用コスメ等のプロフィール情報をまとめて公開できるリンクサービスです。</li>
                  <li>本サービスの利用に必要な端末、通信環境等は、ユーザーが自己の費用と責任で準備するものとします。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第6条（利用料金）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本サービスの基本機能は無料で利用できます。</li>
                  <li>運営者が有料プランを定めた場合、ユーザーは運営者が定める方法により利用料金を支払うものとします。</li>
                  <li>支払い済みの利用料金は、理由の如何を問わず返金いたしません。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第7条（禁止行為）</h3>
                <p className="mb-2 leading-relaxed text-muted-foreground">ユーザーは、本サービスの利用に関連して、以下の行為を行ってはなりません。</p>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>法令または本規約に違反する行為</li>
                  <li>公序良俗に反する行為</li>
                  <li>運営者または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利を侵害する行為</li>
                  <li>第三者になりすまして本サービスを利用する行為</li>
                  <li>本サービスのシステムに対する不正アクセス、過度な負荷をかける行為</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>反社会的勢力等に対する利益供与その他関与する行為</li>
                  <li>虚偽の情報を登録・公開する行為</li>
                  <li>他のユーザーの情報を不正に収集する行為</li>
                  <li>本サービスを商業目的で無断利用する行為（運営者が許可した場合を除く）</li>
                  <li>コンピュータウイルス等の有害なプログラムを送信する行為</li>
                  <li>本サービスのプログラムを解析、改変、逆コンパイルする行為</li>
                  <li>その他運営者が不適切と判断する行為</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第4章 サービスの管理・運営 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第4章 サービスの管理・運営</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第8条（サービスの変更・停止・終了）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>運営者は、以下の場合に本サービスの全部または一部を変更、停止、中断または終了することができます。
                    <ul className="list-disc pl-6 mt-1 space-y-0.5">
                      <li>システムの保守、更新を行う場合</li>
                      <li>天災、停電、通信障害等の不可抗力が生じた場合</li>
                      <li>セキュリティ上の問題が生じた場合</li>
                      <li>連携サービスの変更・停止があった場合</li>
                      <li>経営上の理由により必要と判断した場合</li>
                    </ul>
                  </li>
                  <li>運営者は、前項の措置によりユーザーに生じた損害について、運営者に故意または重過失がある場合を除き、責任を負いません。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第9条（利用停止・契約解除）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>ユーザーが以下のいずれかに該当する場合、運営者は事前の通知なく、本サービスの利用を停止しまたは契約を解除することができます。
                    <ul className="list-disc pl-6 mt-1 space-y-0.5">
                      <li>本規約に違反した場合</li>
                      <li>登録情報に虚偽があった場合</li>
                      <li>運営者からの連絡に対し30日以上応答がない場合</li>
                      <li>12ヶ月以上ログインがない場合</li>
                      <li>その他運営者が不適切と判断した場合</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第10条（退会）</h3>
                <p className="leading-relaxed text-muted-foreground">
                  ユーザーは、運営者所定の方法により、いつでも退会することができます。退会した場合、ユーザーのアカウントおよびデータは削除され、復元はできません。
                </p>
              </div>
            </div>
          </section>

          {/* 第5章 知的財産権・コンテンツ */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第5章 知的財産権・コンテンツ</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第11条（知的財産権）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本サービスに関する知的財産権（デザイン、ロゴ、プログラム等）は、運営者または運営者に許諾した第三者に帰属します。</li>
                  <li>投稿コンテンツに関する知的財産権は、ユーザーまたはユーザーに許諾した第三者に帰属します。</li>
                  <li>ユーザーは、投稿コンテンツについて、適法かつ有効に権利を保有していることを保証します。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第6章 免責・損害賠償 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第6章 免責・損害賠償</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第12条（非保証・免責）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>運営者は、本サービスがユーザーの特定の目的に適合すること、期待する機能・正確性・有用性・完全性を有すること、継続的に利用可能であることを保証しません。</li>
                  <li>運営者は、ユーザーの投稿コンテンツのバックアップについて保証しません。ユーザーは自己の責任でバックアップを行うものとします。</li>
                  <li>本サービスの利用に関連してユーザーと第三者との間で生じた紛争は、ユーザーが自己の責任と費用で解決するものとします。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第13条（損害賠償）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>ユーザーが本規約に違反し、運営者または第三者に損害を与えた場合、ユーザーはその損害を賠償するものとします。</li>
                  <li>運営者がユーザーに対して損害賠償責任を負う場合、その範囲は直接かつ現実に発生した通常損害に限り、運営者に故意または重大な過失がある場合を除き、過去1年間にユーザーが支払った利用料金の合計額を上限とします。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第7章 個人情報 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第7章 個人情報</h2>

            <div>
              <h3 className="mb-2 text-base font-semibold text-foreground">第14条（個人情報の取扱い）</h3>
              <p className="leading-relaxed text-muted-foreground">
                運営者は、<Link href="/privacy" className="font-medium text-primary underline underline-offset-2 hover:opacity-80">プライバシーポリシー</Link>に従い、ユーザーの個人情報を適切に取り扱います。ユーザーは、本サービスの利用にあたり、プライバシーポリシーに同意するものとします。
              </p>
            </div>
          </section>

          {/* 第8章 その他 */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-foreground">第8章 その他</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第15条（通知）</h3>
                <p className="leading-relaxed text-muted-foreground">
                  運営者からユーザーへの通知は、本サービス上での表示、登録されたメールアドレスへの送信、その他運営者が適切と判断する方法により行います。
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第16条（本規約の変更）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>運営者は、必要に応じて本規約を変更することができます。変更後の規約は、本サービス上での掲示その他適切な方法で周知します。</li>
                  <li>変更後も本サービスの利用を継続した場合、ユーザーは変更後の規約に同意したものとみなされます。</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第17条（権利義務の譲渡禁止）</h3>
                <p className="leading-relaxed text-muted-foreground">
                  ユーザーは、運営者の事前の承諾なく、本規約上の地位または権利義務を第三者に譲渡してはなりません。
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第18条（分離可能性）</h3>
                <p className="leading-relaxed text-muted-foreground">
                  本規約のいずれかの条項が無効または執行不能と判断された場合であっても、残りの条項は引き続き有効に存続するものとします。
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-foreground">第19条（準拠法および裁判管轄）</h3>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground leading-relaxed">
                  <li>本規約は、日本法に準拠し解釈されるものとします。</li>
                  <li>本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
                </ol>
              </div>
            </div>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            2026年3月 制定・施行
          </p>
        </div>
      </div>
    </main>
  );
}
