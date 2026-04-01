import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NonnoHeaderLeft } from "@/components/landing/NonnoHeaderLeft";
import { NonnoHeaderRight } from "@/components/landing/NonnoHeaderRight";
import { PhoneMockupModes } from "@/components/landing/PhoneMockupModes";

/* =====================================================================
   cosmepik トップページ - non-no web モバイルデザイン完全再現版
   ===================================================================== */

// ノンノカラーパレット
const BG_CREAM = "#f5ece0";         // メインクリーム背景
const BG_CREAM_LIGHT = "#faf4ed";   // 薄いクリーム
const NAV_BLUE = "#8dcfdc";         // スカイブルーナビ
const PINK = "#e8729a";             // ピンクアクセント
const SECTION_PINK = "#f2c4d4";     // セクションピンク背景
const TEXT_DARK = "#1a1a1a";
const TEXT_GRAY = "#888888";
const TEXT_CATEGORY_PINK = "#d94c7a";

// カテゴリラベルの色マッピング
const catColor = (cat: string) => {
  const map: Record<string, string> = {
    ビューティー: "#d94c7a",
    スキンケア: "#d94c7a",
    レシピ: "#d94c7a",
    コスメ: "#e87a50",
    特集: "#9b8ec4",
    連載: "#4a9ec4",
    収益化: "#e87a50",
    使い方: "#4ab894",
    新機能: "#9b8ec4",
  };
  return map[cat] || "#888";
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: BG_CREAM }}>

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* 3カラムヘッダー: LEFT-ICON | LOGO | MENU-ICON */}
        <div className="flex items-center justify-between px-3 py-2" style={{ minHeight: "52px" }}>
          {/* 左: LOGINアイコン */}
          <NonnoHeaderLeft />

          {/* 中央: ロゴ - non-noスタイル */}
          <Link href="/" className="flex flex-col items-center flex-1 mx-2">
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "26px",
                fontWeight: "900",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                color: TEXT_DARK,
                lineHeight: 1,
              }}
            >
              cosme<span style={{ color: PINK }}>·</span>pik
            </span>
            <span
              className="text-[8px] tracking-[0.22em] font-medium mt-0.5"
              style={{ color: TEXT_GRAY }}
            >
              COSME PROFILE LINK
            </span>
          </Link>

          {/* 右: MENUアイコン */}
          <NonnoHeaderRight />
        </div>

        {/* スカイブルーナビバー */}
        <nav
          className="flex overflow-x-auto scrollbar-hide px-2"
          style={{ background: NAV_BLUE, minHeight: "34px" }}
        >
          {[
            { label: "cosmepikとは", href: "#about" },
            { label: "2つのモード", href: "#modes" },
            { label: "使い方", href: "#howto" },
            { label: "収益化", href: "/guide/rakuten-affiliate" },
            { label: "ログイン", href: "/login" },
            { label: "新規登録", href: "/register" },
            { label: "FAQ", href: "/faq" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex-shrink-0 flex items-center px-3 text-[11px] font-medium tracking-wide text-white hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ lineHeight: "34px" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main>

        {/* ========== HERO - スライドショーバナー風 ========== */}
        <section
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #fdf0f6 0%, #fce4ee 50%, #fdf5f0 100%)`,
            minHeight: "220px",
          }}
        >
          {/* 装飾的な円 - ノンノのグラフィック要素 */}
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-30"
            style={{ background: PINK }}
          />
          <div
            className="absolute bottom-0 -left-6 w-28 h-28 rounded-full opacity-20"
            style={{ background: "#9b8ec4" }}
          />

          <div className="relative px-5 pt-8 pb-10">
            <p
              className="text-[10px] tracking-[0.3em] font-bold mb-1"
              style={{ color: PINK }}
            >
              NEW FEATURE
            </p>
            {/* ノンノ風: 小さな日本語 + 大きなイタリック英語 */}
            <p className="text-[13px] font-bold mb-0" style={{ color: TEXT_DARK }}>
              一軍コスメを
            </p>
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "52px",
                fontWeight: "900",
                fontStyle: "italic",
                color: PINK,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              Share
            </p>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#555" }}>
              スキンケアルーティンやお気に入りコスメを<br />
              リンク1つでファンにシェアできます。
            </p>

            {/* CTAボタン - ノンノの丸ボタンスタイル */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/register"
                className="flex items-center justify-center rounded-full py-3 text-sm font-bold text-white tracking-wide"
                style={{
                  background: PINK,
                  boxShadow: `0 4px 14px rgba(232,114,154,0.4)`,
                }}
              >
                無料ではじめる
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-full py-2.5 text-sm font-medium tracking-wide border"
                style={{ color: PINK, borderColor: PINK, background: "white" }}
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>

        {/* ========== WHAT'S NEW ========== */}
        <section className="mt-4 px-3" id="about">
          {/* セクションヘッダー - ノンノスタイル */}
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: TEXT_GRAY }}>
              WHAT&apos;S NEW
            </p>
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "24px",
                fontWeight: "900",
                fontStyle: "italic",
                color: TEXT_DARK,
                lineHeight: 1,
              }}
            >
              新しい記事
            </p>
          </div>

          {/* 記事リスト - ノンノWHAT'S NEW形式 */}
          <div className="space-y-0 bg-white rounded-xl overflow-hidden shadow-sm">
            {[
              {
                cat: "スキンケア",
                date: "2026.04.01",
                title: "朝・夜のスキンケアルーティンをステップ形式で公開できる「レシピモード」がリリース",
              },
              {
                cat: "新機能",
                date: "2026.04.01",
                title: "コスメをグリッドでおしゃれに並べる「シンプルモード」でSNS映えプロフィールを",
              },
              {
                cat: "収益化",
                date: "2026.04.01",
                title: "楽天アフィリエイト連携で、コスメ紹介しながら収益化。登録無料でスタート",
              },
              {
                cat: "使い方",
                date: "2026.04.01",
                title: "InstagramやXのプロフィールリンクに設定するだけ。30秒で無料登録完了",
              },
            ].map((item, i) => (
              <Link
                href="/register"
                key={i}
                className="flex items-start gap-0 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#f0e8e0" }}
              >
                {/* カテゴリカラーバー */}
                <div
                  className="w-1 self-stretch shrink-0"
                  style={{ background: catColor(item.cat) }}
                />
                <div className="flex-1 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: catColor(item.cat) }}
                    >
                      {item.cat}
                    </span>
                    <span className="text-[9px]" style={{ color: TEXT_GRAY }}>
                      {item.date}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium leading-[1.55]" style={{ color: TEXT_DARK }}>
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/register"
            className="flex items-center justify-center gap-1 mt-2 py-2 text-[11px] font-bold tracking-wide"
            style={{ color: PINK }}
          >
            VIEW MORE <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* ========== RANKING - みんなが注目！ ========== */}
        <section className="mt-6 px-3" id="features">
          {/* セクションヘッダー */}
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: TEXT_GRAY }}>
              みんなが注目！
            </p>
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "28px",
                fontWeight: "900",
                fontStyle: "italic",
                color: TEXT_DARK,
                lineHeight: 1,
              }}
            >
              Ranking
            </p>
          </div>

          {/* ALLフィルターボタン - ノンノスタイル */}
          <div className="mb-3">
            {/* ALL ボタン - 幅広ピンク */}
            <div
              className="w-full rounded-full py-2.5 mb-2 text-center text-[13px] font-medium text-white"
              style={{ background: PINK }}
            >
              ALL
            </div>
            {/* カテゴリボタン - 2列グリッド */}
            <div className="grid grid-cols-2 gap-2">
              {["スキンケア", "コスメ", "レシピモード", "シンプルモード", "収益化", "FAQ"].map(
                (label, i) => (
                  <Link
                    href={i === 4 ? "/guide/rakuten-affiliate" : i === 5 ? "/faq" : "/register"}
                    key={i}
                    className="rounded-full py-2 text-center text-[12px] font-medium border hover:bg-pink-50 transition-colors"
                    style={{ color: TEXT_DARK, borderColor: "#ddd", background: "white" }}
                  >
                    {label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Nō 1〜5 ランキングカード */}
          <div className="space-y-3 mt-4">
            {[
              {
                rank: 1,
                cat: "ビューティー",
                title: "スキンケアルーティンをステップで公開！「レシピモード」の使い方ガイド",
                date: "2026.04.01",
                emoji: "🌿",
                bg: "#fce4ee",
              },
              {
                rank: 2,
                cat: "コスメ",
                title: "一軍コスメをグリッドで並べる「シンプルモード」でSNS映えプロフィールを作ろう",
                date: "2026.04.01",
                emoji: "✨",
                bg: "#ede4f8",
              },
              {
                rank: 3,
                cat: "収益化",
                title: "楽天アフィリエイト連携でコスメ紹介しながら報酬GET！設定方法を解説",
                date: "2026.04.01",
                emoji: "💰",
                bg: "#fdf0e4",
              },
              {
                rank: 4,
                cat: "使い方",
                title: "30秒で無料登録！cosmepikの始め方完全ガイド",
                date: "2026.04.01",
                emoji: "📱",
                bg: "#e4f4f8",
              },
              {
                rank: 5,
                cat: "特集",
                title: "パーソナルカラー・肌質・SNSリンクをひとまとめ。美容プロフィールを作成しよう",
                date: "2026.04.01",
                emoji: "🎨",
                bg: "#e8f8e8",
              },
            ].map((item) => (
              <Link
                href="/register"
                key={item.rank}
                className="flex items-start gap-2 hover:opacity-90 transition-opacity"
              >
                {/* Nō番号 - ノンノスタイル */}
                <div className="shrink-0 flex flex-col items-center" style={{ minWidth: "32px" }}>
                  <span
                    className="text-[9px] font-bold tracking-widest"
                    style={{ color: TEXT_CATEGORY_PINK }}
                  >
                    Nō
                  </span>
                  <span
                    style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: "28px",
                      fontWeight: "900",
                      color: TEXT_DARK,
                      lineHeight: 0.9,
                    }}
                  >
                    {item.rank}
                  </span>
                </div>

                {/* サムネイル */}
                <div
                  className="shrink-0 w-20 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ background: item.bg }}
                >
                  {item.emoji}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: catColor(item.cat) }}
                    >
                      {item.cat}
                    </span>
                    <span className="text-[9px]" style={{ color: TEXT_GRAY }}>
                      {item.date}
                    </span>
                  </div>
                  <p
                    className="text-[12px] font-medium leading-[1.5]"
                    style={{ color: TEXT_DARK }}
                  >
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== SERIES - 連載コンテンツ（ピンク背景） ========== */}
        <section
          className="mt-6 px-3 py-6"
          id="modes"
          style={{ background: SECTION_PINK }}
        >
          {/* セクションヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: "#b05070" }}>
                2つのモード
              </p>
              <p
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "26px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: TEXT_DARK,
                  lineHeight: 1,
                }}
              >
                Series
              </p>
            </div>
            {/* ページ数バッジ - ノンノスタイル */}
            <div
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-white"
              style={{ background: NAV_BLUE, fontSize: "11px", fontWeight: "bold" }}
            >
              <span className="text-[13px] font-bold leading-none">1</span>
              <div className="w-6 h-[1px] bg-white/70 my-0.5" />
              <span className="text-[11px] leading-none opacity-80">2</span>
            </div>
          </div>

          {/* スマホモック + モード説明 */}
          <PhoneMockupModes />
        </section>

        {/* ========== PICK UP - 編集部おすすめ ========== */}
        <section className="mt-4 px-3 py-5" style={{ background: BG_CREAM_LIGHT }}>
          {/* セクションヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: TEXT_GRAY }}>
                PICK UP
              </p>
              <p
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "24px",
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: TEXT_DARK,
                  lineHeight: 1,
                }}
              >
                おすすめ機能
              </p>
            </div>
          </div>

          {/* PICK UPカードリスト - ノンノ横スクロール風 */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3">
            {[
              {
                cat: "ビューティー",
                emoji: "🌿",
                bg: "#fce4ee",
                title: "スキンケアルーティンを朝・夜ステップ別に公開",
                badge: "レシピモード",
                badgeColor: "#d94c7a",
              },
              {
                cat: "コスメ",
                emoji: "✨",
                bg: "#ede4f8",
                title: "一軍コスメをグリッドでおしゃれに展示",
                badge: "シンプルモード",
                badgeColor: "#9b8ec4",
              },
              {
                cat: "収益化",
                emoji: "💰",
                bg: "#fdf0e4",
                title: "楽天アフィリエイトで コスメ紹介しながら報酬GET",
                badge: "収益化機能",
                badgeColor: "#e87a50",
              },
              {
                cat: "特集",
                emoji: "🎨",
                bg: "#e4f4f8",
                title: "肌質・パーソナルカラー・SNSリンクをひとまとめ",
                badge: "プロフィール",
                badgeColor: "#4a9ec4",
              },
            ].map((item, i) => (
              <Link
                href="/register"
                key={i}
                className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ border: "1px solid rgba(0,0,0,0.06)" }}
              >
                {/* サムネイル */}
                <div
                  className="w-full h-24 flex items-center justify-center text-4xl"
                  style={{ background: item.bg }}
                >
                  {item.emoji}
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: item.badgeColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium leading-[1.4]" style={{ color: TEXT_DARK }}>
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== HOW TO START ========== */}
        <section className="mt-4 px-3 py-5" id="howto">
          {/* セクションヘッダー */}
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: TEXT_GRAY }}>
              HOW TO START
            </p>
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "26px",
                fontWeight: "900",
                fontStyle: "italic",
                color: TEXT_DARK,
                lineHeight: 1,
              }}
            >
              始め方
            </p>
          </div>

          {/* ステップリスト - ノンノランキング風 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {[
              { step: "01", title: "アカウントを作成", desc: "メールアドレスで無料登録。30秒で完了。" },
              { step: "02", title: "プロフィールを設定", desc: "肌質・パーソナルカラー・SNSリンクを追加。" },
              { step: "03", title: "コスメを追加", desc: "お気に入りアイテムやルーティンを登録。" },
              { step: "04", title: "リンクをシェア", desc: "InstagramやXのプロフィールに貼るだけ。" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0"
                style={{ borderColor: "#f0e8e0" }}
              >
                <span
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "22px",
                    fontWeight: "900",
                    color: PINK,
                    minWidth: "32px",
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>{item.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_GRAY }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="mt-4 w-full flex items-center justify-center rounded-full py-3.5 text-sm font-bold text-white tracking-wide"
            style={{
              background: PINK,
              boxShadow: `0 4px 14px rgba(232,114,154,0.35)`,
            }}
          >
            無料ではじめる
          </Link>
        </section>

        {/* ========== CATEGORY - 気になるカテゴリは？ ========== */}
        <section
          className="mt-4 px-3 py-5"
          style={{ background: SECTION_PINK }}
        >
          <p
            className="text-[12px] font-bold tracking-[0.1em] mb-3"
            style={{ color: "#b05070" }}
          >
            気になるカテゴリは？Category
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "non-noモデル風プロフ", href: "/register" },
              { label: "レシピモード", href: "/register" },
              { label: "シンプルモード", href: "/register" },
              { label: "楽天アフィリエイト", href: "/guide/rakuten-affiliate" },
              { label: "スキンケア", href: "/register" },
              { label: "メイクコスメ", href: "/register" },
              { label: "プロフィール設定", href: "/register" },
              { label: "利用規約", href: "/terms" },
              { label: "プライバシー", href: "/privacy" },
              { label: "FAQ", href: "/faq" },
              { label: "特定商取引法", href: "/tokushoho" },
              { label: "お問い合わせ", href: "/contact" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full border bg-white hover:bg-pink-50 transition-colors"
                style={{ borderColor: "#ddc8d0", color: TEXT_DARK }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ========== HOT KEYWORD ========== */}
        <section className="mt-4 px-3 py-5">
          <p
            className="text-[12px] font-bold tracking-[0.1em] mb-3"
            style={{ color: PINK }}
          >
            Hot Keyword
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "#スキンケアルーティン",
              "#韓国コスメ",
              "#プチプラコスメ",
              "#デパコス",
              "#パーソナルカラー",
              "#敏感肌",
              "#メイクレシピ",
              "#一軍コスメ",
              "#日焼け止め",
              "#美容液",
              "#SNS映えコスメ",
              "#コスメ収集",
            ].map((tag, i) => (
              <Link
                key={i}
                href="/register"
                className="text-[11px] font-medium hover:opacity-70 transition-opacity"
                style={{ color: TEXT_CATEGORY_PINK }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* ========== JOIN MEMBER CTA ========== */}
        <section
          className="mt-4 mx-3 mb-6 rounded-2xl px-5 py-6 text-center"
          style={{
            background: "white",
            border: `1.5px solid ${SECTION_PINK}`,
            boxShadow: "0 2px 16px rgba(232,114,154,0.1)",
          }}
        >
          <p
            className="text-[10px] font-bold tracking-[0.3em] mb-1"
            style={{ color: PINK }}
          >
            JOIN MEMBER
          </p>
          <p className="text-[15px] font-bold mb-1" style={{ color: TEXT_DARK }}>
            cosmepikに登録して<br />コスメリンクを作ろう♡
          </p>
          <p className="text-[11px] mb-4" style={{ color: TEXT_GRAY }}>
            登録するといろんな特典が盛りだくさん
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full px-10 py-3 text-sm font-bold text-white"
            style={{ background: PINK, boxShadow: `0 4px 14px rgba(232,114,154,0.4)` }}
          >
            JOIN MEMBER
          </Link>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="border-t bg-white" style={{ borderColor: "#e8d8e0" }}>
        <div className="px-4 py-6">
          {/* ロゴ */}
          <div className="flex flex-col items-center mb-4">
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "22px",
                fontWeight: "900",
                fontStyle: "italic",
                color: TEXT_DARK,
              }}
            >
              cosme<span style={{ color: PINK }}>·</span>pik
            </span>
            <span className="text-[8px] tracking-[0.2em] mt-0.5" style={{ color: TEXT_GRAY }}>
              COSME PROFILE LINK
            </span>
          </div>

          {/* フッターリンク */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-5 text-[11px]" style={{ color: TEXT_GRAY }}>
            <Link href="/guide" className="hover:opacity-80">使い方ガイド</Link>
            <Link href="/terms" className="hover:opacity-80">利用規約</Link>
            <Link href="/privacy" className="hover:opacity-80">プライバシーポリシー</Link>
            <Link href="/tokushoho" className="hover:opacity-80">特定商取引法</Link>
            <Link href="/faq" className="hover:opacity-80">FAQ</Link>
            <Link href="/contact" className="hover:opacity-80">お問い合わせ</Link>
          </nav>

          {/* 区切り */}
          <div className="flex justify-center gap-1 mb-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: `${PINK}50` }}
              />
            ))}
          </div>

          <p className="text-center text-[10px]" style={{ color: TEXT_GRAY }}>
            &copy; 2026 cosmepik. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
