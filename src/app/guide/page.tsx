import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cosmepik.me";

export const metadata: Metadata = {
  title: "使い方ガイド｜cosmepikでメイクレシピを作って共有・収益化する方法",
  description:
    "cosmepik（コスメピック）の使い方を、登録からプロフィール設定、コスメの追加、メイクレシピの作成、SNSでの共有、楽天アフィリエイトでの収益化まで順を追って解説します。初めての方でも5分で始められます。",
  keywords: [
    "cosmepik 使い方",
    "メイクレシピ 作り方",
    "コスメ まとめ 作り方",
    "メイクレシピ 共有",
    "コスメ 収益化",
    "楽天アフィリエイト",
    "cosmepik",
    "コスメピック",
  ],
  alternates: { canonical: `${SITE_URL}/guide` },
  openGraph: {
    title: "使い方ガイド｜cosmepikでメイクレシピを作って共有・収益化する方法",
    description:
      "登録からプロフィール設定、コスメ追加、メイクレシピ作成、SNS共有、収益化までを丁寧に解説。初めてでも5分で始められます。",
    url: `${SITE_URL}/guide`,
    siteName: "cosmepik",
    type: "article",
  },
};

const STEPS = [
  {
    no: "01",
    title: "無料でアカウントを作成する",
    body:
      "トップページの「無料ではじめる」からメールアドレスとパスワードで登録するか、Google・X（旧Twitter）アカウントを使ってワンタップで登録できます。クレジットカードは不要で、登録から利用開始までは1分ほど。確認メールが届いたら、本文中のリンクをクリックして本登録を完了させてください。メールが見当たらない場合は、迷惑メールフォルダもあわせてご確認ください。",
  },
  {
    no: "02",
    title: "プロフィールを整える",
    body:
      "ダッシュボードでは、表示名・アイコン（アバター）・自己紹介文を設定できます。さらに、肌質（乾燥肌・脂性肌・混合肌・敏感肌など）やパーソナルカラー（イエベ春／ブルベ夏など）、InstagramやXといったSNSへのリンクも登録できます。これらは公開ページに表示され、あなたのコスメ選びの「なぜ」を訪問者に伝える大切な情報になります。プロフィールが充実しているほど、フォロワーがコスメを参考にしやすくなります。",
  },
  {
    no: "03",
    title: "コスメを追加する",
    body:
      "編集画面の「コスメを追加」から、商品名やブランド名で検索してアイテムを登録します。見つけた商品には、使い心地や色味の感想、リピートしている理由などの「愛用コメント」を自由に添えられます。アイテムはグループ（カテゴリ）ごとに並べたり、朝・夜のスキンケアルーティンの順番に沿って整理したりできます。",
  },
  {
    no: "04",
    title: "メイクレシピを作る",
    body:
      "レシピモードでは、ご自身の写真の上に使ったコスメを配置して、ひと目で分かる「メイクレシピ」を作れます。アイテムの位置やサイズを指で動かして調整し、タイトルや一言コメントを添えれば完成。作ったレシピは画像として保存し、SNSにそのまま投稿することもできます。シンプルに一覧で見せたい場合は、シンプルモードでお気に入りコスメをリスト表示するのもおすすめです。",
  },
  {
    no: "05",
    title: "公開リンクをシェアする",
    body:
      "「プレビュー」であなたの公開ページを確認したら、URLをコピーしてInstagramやXのプロフィール欄、ブログ、YouTubeの概要欄などに貼り付けましょう。「そのコスメどこの？」という質問に、リンク1つで答えられるようになります。1つのURLにすべてのお気に入りがまとまるので、投稿のたびに商品名を書く手間もなくなります。",
  },
  {
    no: "06",
    title: "楽天アフィリエイトで収益化する",
    body:
      "無料の楽天アフィリエイトIDを取得してcosmepikに設定すると、あなたのページ経由で楽天市場の商品が購入された際に、売上の一部が報酬として還元されます。設定はすべてのレシピ・コスメリンクに自動で適用されるため、一度登録すれば手間はかかりません。詳しい手順は収益化ガイドで画像つきで解説しています。",
  },
];

const TIPS = [
  {
    title: "コメントは「自分の言葉」で書く",
    body:
      "商品名だけでなく、なぜそれを選んだのか・どんな肌悩みに効いたのかを一言添えると、フォロワーにとっての価値がぐっと高まります。",
  },
  {
    title: "ルーティン順に並べる",
    body:
      "スキンケアは使用順（化粧水→美容液→乳液など）に並べると、見る人がそのまま真似しやすくなります。",
  },
  {
    title: "写真は明るく撮る",
    body:
      "レシピモードの背景写真は、自然光の入る明るい場所で撮ると色味が正確に伝わり、コスメの魅力も引き立ちます。",
  },
];

export default function GuidePage() {
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "cosmepikの使い方",
    description:
      "cosmepikでメイクレシピを作成し、SNSで共有して収益化するまでの手順。",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
      url: `${SITE_URL}/guide#step-${i + 1}`,
    })),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <AppHeader>
        <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ログイン</Link>
        <Link href="/register" className="rounded-lg bg-green py-2 px-4 text-sm font-medium text-green-foreground hover:opacity-90">新規登録</Link>
      </AppHeader>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-foreground">cosmepikの使い方ガイド</h1>
        <p className="mb-10 leading-relaxed text-muted-foreground">
          cosmepik（コスメピック）は、あなたの愛用コスメやメイクレシピを1つのページにまとめて、
          SNSで共有・収益化できる無料サービスです。このガイドでは、アカウント登録からメイクレシピの作成、
          公開リンクのシェア、楽天アフィリエイトを使った収益化までの流れを、初めての方にも分かるように
          順を追って解説します。所要時間は最短5分。スマートフォンだけで完結します。
        </p>

        <div className="space-y-8 text-muted-foreground">
          {STEPS.map((s, i) => (
            <section key={s.no} id={`step-${i + 1}`}>
              <h2 className="mb-2 flex items-center gap-3 text-lg font-semibold text-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green/15 text-sm font-bold text-green">
                  {s.no}
                </span>
                {s.title}
              </h2>
              <p className="leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-semibold text-foreground">もっと魅力的に見せるコツ</h2>
        <div className="space-y-4">
          {TIPS.map((t) => (
            <div key={t.title} className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-sm font-bold text-foreground">{t.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 rounded-2xl bg-green/[0.06] p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            収益化の具体的な手順は
            <Link href="/guide/rakuten-affiliate" className="mx-1 font-medium text-green hover:underline">
              楽天アフィリエイト登録ガイド
            </Link>
            で、よくある質問は
            <Link href="/faq" className="mx-1 font-medium text-green hover:underline">
              FAQページ
            </Link>
            でそれぞれ詳しく案内しています。
          </p>
          <Link
            href="/register"
            className="inline-flex w-fit items-center rounded-full bg-green px-6 py-2.5 text-sm font-bold text-green-foreground hover:opacity-90"
          >
            無料で始める →
          </Link>
        </div>
      </div>
    </main>
  );
}
