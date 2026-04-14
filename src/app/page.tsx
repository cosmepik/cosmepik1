import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { PhoneMockupModes } from "@/components/landing/PhoneMockupModes";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { createAdminClient } from "@/lib/supabase/admin";

/* =====================================================================
   cosmepik トップページ - non-no web モバイルデザイン完全再現版
   ===================================================================== */

// ノンノカラーパレット
const BG_CREAM = "#ffffff";         // メイン背景（白）
const BG_CREAM_LIGHT = "#ffffff";   // セクション背景（白）
const NAV_BLUE = "#8dcfdc";         // スカイブルーナビ
const PINK = "#e8729a";             // ピンクアクセント
const SECTION_PINK = "#f2c4d4";     // セクションピンク背景
const TEXT_DARK = "#1a1a1a";
const TEXT_GRAY = "#888888";
const TEXT_CATEGORY_PINK = "#d94c7a";

/** セクション見出し（フラットな薄ピンク箱・1px黒枠・角なし・サンセリフ） */
const SECTION_HEADING_BG = "#f2b6bb";
const SECTION_HEADING_FONT =
  'var(--font-noto-sans), "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif';

function SectionHeading({ label, title }: { label: string; title: string }) {
  const showLabel = label.trim().length > 0;
  return (
    <div className="mb-5">
      <div
        style={{
          background: SECTION_HEADING_BG,
          border: "1px solid #000000",
          borderRadius: 0,
          padding: "9px 18px",
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: SECTION_HEADING_FONT,
          boxShadow: "none",
        }}
      >
        {showLabel ? (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#000000",
              letterSpacing: "normal",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        ) : null}
        <span
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "#000000",
            letterSpacing: "normal",
            lineHeight: 1.35,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

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

interface BlogPost {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  created_at: string;
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const admin = createAdminClient();
    if (!admin) return [];
    const { data } = await admin
      .from("blog_posts")
      .select("id, title, category, thumbnail_url, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(5);
    return (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const blogPosts = await fetchBlogPosts();
  return (
    <div className="min-h-screen" style={{ background: BG_CREAM }}>

      {/* ========== HEADER ========== */}
      <LandingHeader />

      <main
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#f5f5f5",
        }}
      >

        {/* ========== HERO ========== */}
        <section className="relative overflow-hidden px-3 pt-4">

          <div
            className="relative flex flex-col items-center rounded-2xl px-5 pt-10 pb-8 overflow-hidden"
            style={{ background: "rgba(242, 196, 212, 0.45)" }}
          >
            {/* キャッチコピー */}
            <div className="relative z-10 mb-8 flex flex-col items-center">
              <CosmepikLogo height={36} color={NAV_BLUE} />
              <div className="relative mt-4 rounded-2xl bg-white px-5 py-4 shadow-sm" style={{ border: "1.5px solid #eee" }}>
                <p className="text-[15px] font-bold leading-relaxed text-center" style={{ color: TEXT_DARK }}>
                  メイクレシピを超簡単に作成、<br />収益化しよう！
                </p>
                {/* 吹き出しの三角 */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: "-10px",
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderTop: "10px solid white",
                    filter: "drop-shadow(0 1px 0 #eee)",
                  }}
                />
              </div>
            </div>

            {/* スマホモック */}
            <div className="relative z-10 w-[220px] mx-auto mb-8 flex justify-center">
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: "32px",
                  border: "4px solid #1a1a1a",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset",
                }}
              >
                <Image
                  src="/hero-mockup.png"
                  alt="cosmepikのプロフィール画面"
                  width={854}
                  height={1931}
                  quality={90}
                  className="w-full h-auto block"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  priority
                />
              </div>
              {/* ホームバー */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2"
                style={{ width: "60px", height: "4px", background: "#333", borderRadius: "2px" }}
              />
            </div>

            {/* CTAボタン */}
            <div className="relative z-10 flex flex-col gap-2.5 w-full max-w-xs">
              <Link
                href="/register"
                className="flex items-center justify-center rounded-full py-3.5 text-sm font-bold text-white tracking-wide transition-opacity hover:opacity-90"
                style={{
                  background: PINK,
                  boxShadow: `0 4px 14px rgba(232,114,154,0.4)`,
                }}
              >
                無料ではじめる
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-full py-3 text-sm font-medium tracking-wide border transition-colors hover:bg-white/80"
                style={{ color: TEXT_DARK, borderColor: "#ccc", background: "white" }}
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>

        {/* ========== cosmepikって何ができるの？ ========== */}
        <section className="mt-6 px-3 py-6" id="about">
          <SectionHeading label="#cosmepikって" title="何ができるの？" />
          <div className="mt-4 space-y-3">
            {[
              { icon: "📸", title: "メイクレシピを作成", desc: "写真の上にコスメを配置して、あなただけのメイクレシピを簡単に作れます" },
              { icon: "🔗", title: "リンクでシェア", desc: "作ったレシピをSNSのプロフィールに貼って、フォロワーにシェアできます" },
              { icon: "💰", title: "コスメで収益化", desc: "紹介したコスメが購入されると、売上の一部があなたの報酬になります" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2">
                <div
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: SECTION_PINK }}
                >
                  <span className="text-base">{item.icon}</span>
                </div>
                <div
                  className="flex-1 bg-white px-4 py-3 shadow-sm"
                  style={{ border: "1px solid #f0f0f0", borderRadius: "2px 20px 20px 20px" }}
                >
                  <p className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>{item.title}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: TEXT_GRAY }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 2つのモード ========== */}
        <section className="mt-6 px-3 py-6" id="modes">
          <div className="flex items-start justify-between">
            <SectionHeading label="選べる！" title="二つのモードで自分らしく" />
            {/* ページ数バッジ - ノンノスタイル */}
            <div
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-white shrink-0 mt-1"
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

        {/* ========== 収益化セクション ========== */}
        <section className="mt-6 px-3 py-6" id="monetize">
          <SectionHeading label="あなたの" title="メイクレシピを収益化" />

          <p className="text-[15px] font-bold leading-relaxed mt-3 mb-5" style={{ color: PINK }}>
            cosmepikで紹介したコスメが購入されると、<br />
            売上の一部があなたの報酬に。
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: PINK }}
              >
                1
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>楽天アフィリエイトと連携</p>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_GRAY }}>
                  無料の楽天アフィリエイトIDを取得して、cosmepikに設定するだけ。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: PINK }}
              >
                2
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>コスメを紹介するだけ</p>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_GRAY }}>
                  レシピモードやシンプルモードでお気に入りコスメをシェア。リンクには自動でアフィリエイトIDが付きます。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: PINK }}
              >
                3
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>購入されたら報酬GET</p>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_GRAY }}>
                  あなたのページ経由で楽天市場の商品が購入されると、成果報酬が発生。登録も利用も完全無料です。
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-5">
            <Link
              href="/guide/rakuten-affiliate"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: PINK }}
            >
              収益化ガイドを見る
            </Link>
          </div>
        </section>

        {/* ========== おすすめピック ========== */}
        <section className="mt-6 px-3" id="features">
          <SectionHeading label="#cosmepik編集部" title="Pickup!" />

          {blogPosts.length === 0 ? (
            <div
              className="mt-4 relative flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ minHeight: "160px" }}
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: "rgba(245,245,245,0.5)", filter: "blur(0.5px)" }}
              />
              <p className="relative text-[14px] font-medium" style={{ color: "#aaaaaa" }}>
                記事を準備中です
              </p>
            </div>
          ) : (
            <div className="mt-4" style={{ border: "1.5px dashed #333" }}>
              {blogPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group flex items-center gap-3 px-3 py-2 transition-all hover:opacity-80"
                  style={i > 0 ? { borderTop: "1.5px dashed #333" } : undefined}
                >
                  {post.thumbnail_url ? (
                    <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-lg">
                      <Image src={post.thumbnail_url} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-lg" style={{ background: SECTION_PINK }}>
                      <span className="text-xl">📝</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="text-[11px] font-bold" style={{ color: catColor(post.category) }}>{post.category}</span>
                    <p className="mt-1 text-[13px] font-bold leading-[1.45] line-clamp-3" style={{ color: TEXT_DARK }}>{post.title}</p>
                  </div>
                </Link>
              ))}
              <Link
                href="/blog"
                className="flex items-center justify-center py-3 text-[13px] font-bold tracking-[0.15em] transition-opacity hover:opacity-60"
                style={{ color: TEXT_DARK, borderTop: "1.5px dashed #333" }}
              >
                VIEW MORE
              </Link>
            </div>
          )}
        </section>

        {/* ========== HOW TO START ========== */}
        <section className="mt-4 px-3 py-5" id="howto">
          <SectionHeading label="HOW TO START" title="始め方" />

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
                    fontFamily: SECTION_HEADING_FONT,
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
          <SectionHeading label="気になるカテゴリは？" title="Category" />
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
          <SectionHeading label="" title="Hot Keyword" />
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
          <div className="flex justify-center mb-1">
            <SectionHeading label="" title="Join Member" />
          </div>
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
            <CosmepikLogo height={32} color={NAV_BLUE} />
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
