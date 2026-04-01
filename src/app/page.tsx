import Link from "next/link";
import Image from "next/image";
import { LandingHeaderActions } from "@/components/landing/LandingHeaderActions";
import { PhoneMockupModes } from "@/components/landing/PhoneMockupModes";
import {
  Instagram,
  Twitter,
  Youtube,
  ChevronRight,
  Sparkles,
  BookOpen,
  Heart,
  Star,
} from "lucide-react";

/* =====================================================================
   cosmepik トップページ - non-no web スタイル
   ===================================================================== */

const NONNO_PINK = "#c8536e";
const NONNO_DARK = "#1a1a1a";
const NONNO_GRAY = "#888";
const NONNO_LIGHT_PINK = "#fdf0f4";
const NONNO_BORDER = "#f0e0e5";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: NONNO_BORDER }}>
        {/* Top Bar - ピンクのアクセントライン */}
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${NONNO_PINK} 0%, #e87a96 50%, ${NONNO_PINK} 100%)` }} />

        <div className="mx-auto max-w-[768px] px-4">
          {/* ロゴエリア */}
          <div className="flex items-center justify-between py-3">
            {/* ロゴ: ノンノ風 - cosmepik をセリフ体で */}
            <Link href="/" className="flex flex-col items-start leading-none">
              <span
                className="font-serif tracking-widest font-bold"
                style={{ fontSize: "22px", color: NONNO_PINK, letterSpacing: "0.08em" }}
              >
                cosmepik
              </span>
              <span className="text-[8px] tracking-[0.25em] font-medium mt-0.5" style={{ color: NONNO_GRAY }}>
                COSME PROFILE LINK
              </span>
            </Link>

            {/* ヘッダーアクション（ログイン/新規登録） */}
            <LandingHeaderActions />
          </div>

          {/* カテゴリナビ - non-no風タブナビ */}
          <nav className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 pb-0 gap-0 border-t" style={{ borderColor: NONNO_BORDER }}>
            {[
              { label: "TOP", href: "/" },
              { label: "使い方", href: "#howto" },
              { label: "モード紹介", href: "#modes" },
              { label: "特徴", href: "#features" },
              { label: "収益化", href: "/guide/rakuten-affiliate" },
              { label: "FAQ", href: "/faq" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex-shrink-0 px-3 py-2.5 text-[11px] font-medium tracking-wide transition-colors hover:opacity-80 relative"
                style={{ color: i === 0 ? NONNO_PINK : NONNO_DARK, borderBottom: i === 0 ? `2px solid ${NONNO_PINK}` : "2px solid transparent", marginBottom: "-1px" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[768px]">

        {/* ========== HERO SECTION - ノンノ表紙風 ========== */}
        <section className="relative overflow-hidden" style={{ background: NONNO_LIGHT_PINK }}>
          {/* メインビジュアル */}
          <div className="relative px-4 pt-6 pb-8">
            {/* ハッシュタグ */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: NONNO_PINK }}>
                #コスメ好きに
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#9b8ec4" }}>
                #スキンケア
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#e87a50" }}>
                #一軍コスメ
              </span>
            </div>

            {/* メインコピー */}
            <div className="mb-5">
              <p className="text-[10px] tracking-[0.3em] font-medium mb-2" style={{ color: NONNO_PINK }}>
                COSME PROFILE LINK
              </p>
              <h1 className="font-serif leading-[1.2] mb-3" style={{ fontSize: "clamp(28px, 8vw, 38px)", color: NONNO_DARK }}>
                一軍コスメを<br />
                <span className="italic" style={{ color: NONNO_PINK }}>ファンに</span>シェア
              </h1>
              <p className="text-[13px] leading-[1.8]" style={{ color: "#555" }}>
                お気に入りのコスメやスキンケアルーティンを<br />
                1つのリンクにまとめて共有できます。
              </p>
            </div>

            {/* CTAボタン群 */}
            <div className="flex flex-col gap-2.5 mb-5">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-full py-3.5 px-8 text-sm font-bold tracking-wide text-white transition-all hover:opacity-90 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${NONNO_PINK} 0%, #e87a96 100%)`, boxShadow: `0 4px 16px rgba(200,83,110,0.35)` }}
              >
                <Sparkles className="w-4 h-4" />
                無料でコスメリンクを作成
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-full py-3 px-8 text-sm font-medium tracking-wide transition-all hover:opacity-80 border"
                style={{ color: NONNO_PINK, borderColor: NONNO_PINK, background: "white" }}
              >
                ログインはこちら
              </Link>
            </div>

            <p className="text-[10px] text-center" style={{ color: NONNO_GRAY }}>
              登録無料・クレジットカード不要
            </p>
          </div>

          {/* 区切りライン */}
          <div className="h-px" style={{ background: NONNO_BORDER }} />

          {/* TOPICS風 小特集バナー */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[
                { tag: "NEW", text: "スキンケアルーティンを公開", color: "#c8536e" },
                { tag: "SPECIAL", text: "コスメリストで収益化", color: "#9b8ec4" },
                { tag: "GUIDE", text: "楽天アフィリエイト連携", color: "#e87a50" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={i === 2 ? "/guide/rakuten-affiliate" : "/register"}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[10px] font-medium"
                  style={{ background: item.color, minWidth: "max-content" }}
                >
                  <span className="text-[9px] font-bold opacity-80">{item.tag}</span>
                  <span>{item.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========== WHAT'S NEW風 - 機能ハイライトカード ========== */}
        <section className="px-4 py-6 border-b" style={{ borderColor: NONNO_BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: NONNO_PINK }}>WHAT'S NEW</span>
              <span className="text-[11px] tracking-wide text-gray-400">新しいcosmepik</span>
            </div>
            <Link href="#features" className="flex items-center gap-0.5 text-[10px]" style={{ color: NONNO_PINK }}>
              VIEW MORE <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* カードリスト - ノンノ記事カード風 */}
          <div className="space-y-3">
            {[
              {
                category: "ビューティー",
                categoryColor: "#c8536e",
                date: "2026.04.01",
                title: "スキンケアルーティンをステップ形式でファンに公開できる「レシピモード」登場",
                icon: "🌿",
              },
              {
                category: "特集",
                categoryColor: "#9b8ec4",
                date: "2026.04.01",
                title: "お気に入りコスメをグリッドでおしゃれに並べる「シンプルモード」で映えプロフィールを",
                icon: "✨",
              },
              {
                category: "収益化",
                categoryColor: "#e87a50",
                date: "2026.04.01",
                title: "楽天アフィリエイトと連携してコスメを紹介しながら収益化。登録無料でスタート",
                icon: "💰",
              },
            ].map((item, i) => (
              <Link href="/register" key={i} className="flex items-start gap-3 py-2 hover:opacity-80 transition-opacity">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${item.categoryColor}18` }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${item.categoryColor}18`, color: item.categoryColor }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[9px]" style={{ color: NONNO_GRAY }}>{item.date}</span>
                  </div>
                  <p className="text-[12px] font-medium leading-[1.5]" style={{ color: NONNO_DARK }}>
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== MODES SECTION - スマホモック ========== */}
        <section id="modes" className="px-4 py-8 border-b" style={{ borderColor: NONNO_BORDER }}>
          {/* セクションヘッダー - ノンノ風 */}
          <div className="mb-6 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] mb-1" style={{ color: NONNO_PINK }}>
              FEATURES
            </p>
            <h2 className="font-serif text-[22px] font-bold leading-tight mb-2" style={{ color: NONNO_DARK }}>
              2つのモードで<br />
              <span className="italic" style={{ color: NONNO_PINK }}>あなたらしく</span>魅せる
            </h2>
            <p className="text-[12px] leading-relaxed" style={{ color: "#666" }}>
              スキンケアルーティンをステップで見せる「レシピモード」と<br />
              コスメをおしゃれに並べる「シンプルモード」。<br />
              自分のスタイルに合わせて選べます。
            </p>
          </div>

          {/* スマホモックアップ - タブ切り替え付き */}
          <PhoneMockupModes />
        </section>

        {/* ========== PICK UP 風 - 3つの特徴 ========== */}
        <section id="features" className="px-4 py-8 border-b" style={{ borderColor: NONNO_BORDER, background: "#fdf8fa" }}>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[2px] w-6" style={{ background: NONNO_PINK }} />
              <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: NONNO_PINK }}>PICK UP</span>
            </div>
            <p className="text-[10px] tracking-wide" style={{ color: NONNO_GRAY }}>編集部のおすすめ機能</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                num: "01",
                icon: <BookOpen className="w-5 h-5" style={{ color: NONNO_PINK }} />,
                title: "スキンケアルーティン共有",
                subtitle: "ROUTINE",
                desc: "朝・夜のスキンケア手順をステップ形式で分かりやすく。「何使ってる？」の質問にリンク1つで答えられます。",
                tag: "レシピモード",
                tagColor: "#c8536e",
              },
              {
                num: "02",
                icon: <Heart className="w-5 h-5" style={{ color: "#9b8ec4" }} />,
                title: "お気に入りコスメ",
                subtitle: "FAVORITES",
                desc: "愛用アイテムをグリッドでまとめておしゃれにコレクション。SNSプロフィールリンクとして最適です。",
                tag: "シンプルモード",
                tagColor: "#9b8ec4",
              },
              {
                num: "03",
                icon: <Star className="w-5 h-5" style={{ color: "#e87a50" }} />,
                title: "楽天アフィリエイト連携",
                subtitle: "MONETIZE",
                desc: "登録した商品に楽天アフィリエイトリンクを付けて収益化。紹介するだけで報酬が得られます。",
                tag: "収益化機能",
                tagColor: "#e87a50",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-3 p-3.5 rounded-2xl bg-white border"
                style={{ borderColor: NONNO_BORDER, boxShadow: "0 2px 8px rgba(200,83,110,0.06)" }}
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${feature.tagColor}12` }}
                  >
                    {feature.icon}
                  </div>
                  <span
                    className="font-serif text-[22px] font-light"
                    style={{ color: `${feature.tagColor}30` }}
                  >
                    {feature.num}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] tracking-[0.2em] font-medium mb-0.5" style={{ color: NONNO_GRAY }}>
                    {feature.subtitle}
                  </p>
                  <h3 className="text-[13px] font-bold mb-1.5" style={{ color: NONNO_DARK }}>
                    {feature.title}
                  </h3>
                  <p className="text-[11px] leading-[1.7]" style={{ color: "#666" }}>
                    {feature.desc}
                  </p>
                  <span
                    className="inline-flex items-center gap-0.5 mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: feature.tagColor }}
                  >
                    {feature.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== HOW TO START - ランキング風ステップ ========== */}
        <section id="howto" className="px-4 py-8 border-b" style={{ borderColor: NONNO_BORDER }}>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: NONNO_PINK }}>HOW TO START</span>
            </div>
            <h2 className="font-serif text-[20px] font-bold" style={{ color: NONNO_DARK }}>
              始め方は<span className="italic" style={{ color: NONNO_PINK }}>シンプル</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { rank: "1", title: "アカウントを作成", desc: "メールアドレスで無料登録。30秒で完了。", icon: "📝" },
              { rank: "2", title: "プロフィールを設定", desc: "肌質やパーソナルカラー、SNSリンクを追加。", icon: "👤" },
              { rank: "3", title: "コスメを追加", desc: "お気に入りアイテムやルーティンを登録。", icon: "💄" },
              { rank: "4", title: "リンクをシェア", desc: "InstagramやXのプロフィールに貼るだけ。", icon: "🔗" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3.5 border-b last:border-b-0" style={{ borderColor: NONNO_BORDER }}>
                {/* ランク番号 */}
                <div
                  className="flex items-center justify-center shrink-0 font-serif font-bold rounded-full text-white w-8 h-8 text-sm shadow-sm"
                  style={{ background: i === 0 ? "#c8a830" : i === 1 ? "#aaaaaa" : i === 2 ? "#c8843e" : NONNO_PINK }}
                >
                  {item.rank}
                </div>
                <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold mb-0.5" style={{ color: NONNO_DARK }}>{item.title}</p>
                  <p className="text-[11px]" style={{ color: "#777" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== EDITORS SECTION 風 - SNS紹介 ========== */}
        <section className="px-4 py-8 border-b" style={{ borderColor: NONNO_BORDER }}>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[2px] w-6" style={{ background: "#9b8ec4" }} />
              <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: "#9b8ec4" }}>SNS & COMMUNITY</span>
            </div>
            <h2 className="font-serif text-[20px] font-bold" style={{ color: NONNO_DARK }}>
              コスメ好きと<br />
              <span className="italic" style={{ color: "#9b8ec4" }}>つながろう</span>
            </h2>
          </div>

          {/* SNSボタン */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[
              { name: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "#E1306C", desc: "コスメ投稿シェア" },
              { name: "X (Twitter)", icon: <Twitter className="w-4 h-4" />, color: "#1DA1F2", desc: "最新情報をチェック" },
              { name: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "#FF0000", desc: "コスメ動画まとめ" },
              { name: "LINE", icon: <span className="text-sm font-bold">L</span>, color: "#00B900", desc: "友達に紹介する" },
            ].map((sns, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-xl border"
                style={{ borderColor: `${sns.color}30`, background: `${sns.color}08` }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: sns.color }}
                >
                  {sns.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold" style={{ color: NONNO_DARK }}>{sns.name}</p>
                  <p className="text-[9px]" style={{ color: NONNO_GRAY }}>{sns.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FOLLOW ME メッセージ */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: `linear-gradient(135deg, ${NONNO_LIGHT_PINK} 0%, #f4f0ff 100%)`, border: `1px solid ${NONNO_BORDER}` }}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: NONNO_PINK }}>JOIN MEMBER</p>
            <p className="text-[13px] font-bold mb-1" style={{ color: NONNO_DARK }}>
              cosmepikに登録して<br />コスメリンクを作ろう♡
            </p>
            <p className="text-[10px] mb-3" style={{ color: "#888" }}>
              登録するといろんな特典が盛りだくさん
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-7 py-2.5 text-[13px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${NONNO_PINK} 0%, #e87a96 100%)`, boxShadow: `0 3px 12px rgba(200,83,110,0.3)` }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              JOIN MEMBER
            </Link>
          </div>
        </section>

        {/* ========== HOT KEYWORD 風 - カテゴリ ========== */}
        <section className="px-4 py-6 border-b" style={{ borderColor: NONNO_BORDER }}>
          <p className="text-[11px] font-bold tracking-[0.2em] mb-3" style={{ color: NONNO_PINK }}>
            Hot Keyword
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "#スキンケアルーティン",
              "#韓国コスメ",
              "#日焼け止め",
              "#化粧水",
              "#プチプラコスメ",
              "#デパコス",
              "#メイクレシピ",
              "#パーソナルカラー",
              "#敏感肌",
              "#美容液",
              "#下地",
              "#ファンデーション",
              "#SNS映え",
              "#一軍コスメ",
            ].map((tag, i) => (
              <Link
                key={i}
                href="/register"
                className="text-[11px] px-3 py-1 rounded-full border transition-colors hover:opacity-80"
                style={{ color: NONNO_PINK, borderColor: `${NONNO_PINK}40`, background: `${NONNO_PINK}08` }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* ========== GET STARTED CTA ========== */}
        <section
          className="px-4 py-10 text-center"
          style={{ background: `linear-gradient(160deg, #fff0f4 0%, #f7f0ff 100%)` }}
        >
          <p className="text-[10px] font-bold tracking-[0.3em] mb-2" style={{ color: NONNO_PINK }}>
            GET STARTED
          </p>
          <h2 className="font-serif text-[24px] font-bold mb-3 leading-tight" style={{ color: NONNO_DARK }}>
            今すぐ始めよう
          </h2>
          <p className="text-[12px] mb-6" style={{ color: "#777" }}>
            登録無料。クレジットカード不要。
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-bold text-white transition-all hover:opacity-90 mb-3"
            style={{
              background: `linear-gradient(135deg, ${NONNO_PINK} 0%, #e87a96 100%)`,
              boxShadow: `0 6px 20px rgba(200,83,110,0.4)`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            コスメリンクを作成
          </Link>
          <p className="text-[10px]" style={{ color: NONNO_GRAY }}>
            登録無料 / クレジットカード不要
          </p>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t" style={{ borderColor: NONNO_BORDER }}>
        <div className="mx-auto max-w-[768px] px-4 py-8">
          {/* ロゴ */}
          <div className="flex flex-col items-center mb-6">
            <span
              className="font-serif font-bold tracking-widest mb-1"
              style={{ fontSize: "20px", color: NONNO_PINK }}
            >
              cosmepik
            </span>
            <span className="text-[9px] tracking-[0.2em]" style={{ color: NONNO_GRAY }}>
              COSME PROFILE LINK
            </span>
          </div>

          {/* ナビリンク */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6 text-[11px]" style={{ color: NONNO_GRAY }}>
            <Link href="/guide" className="hover:opacity-80 transition-opacity">ABOUT</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">利用規約</Link>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">プライバシーポリシー</Link>
            <Link href="/tokushoho" className="hover:opacity-80 transition-opacity">特定商取引法</Link>
            <Link href="/faq" className="hover:opacity-80 transition-opacity">FAQ</Link>
            <Link href="/contact" className="hover:opacity-80 transition-opacity">お問い合わせ</Link>
          </nav>

          {/* アイコン装飾 */}
          <div className="flex justify-center items-center gap-1.5 mb-5 text-gray-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ background: `${NONNO_PINK}40` }} />
            ))}
          </div>

          {/* コピーライト */}
          <p className="text-center text-[10px]" style={{ color: NONNO_GRAY }}>
            &copy; 2026 cosmepik. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
