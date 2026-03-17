import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function TokushohoPage() {
  return (
    <main className="min-h-screen">
      <AppHeader>
        <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground">使い方</Link>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
      </AppHeader>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">特定商取引法に基づく表記</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          最終更新日：2026年3月
        </p>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm text-sm text-foreground">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top w-[140px] md:w-[180px]">
                  事業者名
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  cosmepik
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  運営責任者
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  山口穣之
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  所在地
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  東京都目黒区洗足2-7-21-201
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  電話番号
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  ご連絡はメールアドレスにお願いいたします
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  メールアドレス
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  <a href="mailto:cosmepik.team@gmail.com" className="font-medium text-green hover:underline">
                    cosmepik.team@gmail.com
                  </a>
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  販売価格
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  各プランの料金ページに表示された価格（税込）
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  販売価格以外の<br className="md:hidden" />必要料金
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  インターネット接続に必要な通信費はお客様のご負担となります
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  支払方法
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  クレジットカード（Stripe を通じた決済）
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  支払時期
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  お申し込み時に即時決済。以降、契約期間に応じて自動更新時に課金されます
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  サービス提供時期
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  決済完了後、即時ご利用いただけます
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  返品・キャンセル
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  デジタルサービスの性質上、お支払い後の返金は原則として行っておりません。サブスクリプションはいつでも解約可能で、解約後は次回更新日まで引き続きご利用いただけます
                </td>
              </tr>
              <tr>
                <th className="whitespace-nowrap bg-muted/30 px-4 py-3.5 text-left font-semibold align-top">
                  動作環境
                </th>
                <td className="px-4 py-3.5 text-muted-foreground">
                  最新版の Google Chrome、Safari、Firefox、Edge 等のモダンブラウザ。インターネット接続が必要です
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8">
          <Link href="/" className="font-medium text-green hover:underline">← トップに戻る</Link>
        </p>
      </div>
    </main>
  );
}
