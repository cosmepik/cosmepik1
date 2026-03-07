import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

const FAQ_ITEMS = [
  {
    q: "無料で使えますか？",
    a: "はい、無料でご利用いただけます。登録にクレジットカードは不要です。お気に入りのコスメを1つのリンクにまとめて、SNSやブログでシェアする機能をご利用いただけます。",
  },
  {
    q: "cosmepikでできることは？",
    a: "愛用コスメやスキンケアルーティンを、1つの専用ページにまとめて公開できます。「何使ってる？」という質問に、リンク1つで答えられるようにできます。肌質・パーソナルカラーやSNSリンクもプロフィールに載せられます。",
  },
  {
    q: "どうやって登録しますか？",
    a: "メールアドレスとパスワードで登録するか、Google・X（Twitter）アカウントで「〇〇でログイン」からすぐに始められます。登録後、ダッシュボードからプロフィールやコスメリストを編集できます。",
  },
  {
    q: "自分のコスメページのURLはどこでわかりますか？",
    a: "ログイン後、ダッシュボードの「プレビュー」を押すと、あなたの公開ページが表示されます。そのページのURLが、あなたのコスメページのリンクです。このURLをInstagramやXのプロフィール欄に貼って使う方が多いです。",
  },
  {
    q: "コスメはどうやって追加しますか？",
    a: "ダッシュボードで「コスメを追加」から、商品名・カテゴリなどで検索して追加できます。気になる商品を選び、愛用コメントを付けてセクションに並べられます。ルーティン（朝・夜のケア順）として並べることもできます。",
  },
  {
    q: "確認メールが届きません",
    a: "メールで登録した場合、確認メールが届くまで少々お待ちください。届かない場合は、迷惑メールフォルダやゴミ箱をご確認ください。それでも見つからない場合は、GoogleやXでログインするか、お問い合わせよりご連絡ください。",
  },
  {
    q: "公開ページをやめたり、アカウントを削除したい",
    a: "ログイン後、ダッシュボードのメニューから「アカウント設定」を開き、「退会する」から手続きできます。退会するとプロフィールやコスメリストなどすべてのデータが削除され、復元できません。",
  },
  {
    q: "その他、質問や要望がある",
    a: "ご不明点・ご要望はお問い合わせページ、または cosmepik.team@gmail.com までお気軽にどうぞ。返信までお時間をいただく場合があります。",
  },
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
