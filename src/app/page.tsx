import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroSlideshow } from "@/components/landing/HeroSlideshow";
import { HeroLinkInput } from "@/components/landing/HeroLinkInput";
import { LandingHeaderActions } from "@/components/landing/LandingHeaderActions";

/**
 * トップページ (LP) - cosmepik ランディングページ
 * ログイン済み: ダッシュボードへリダイレクト
 * 未ログイン: サービス概要・サインイン・サインアップ誘導
 */
export default async function LandingPage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      redirect("/dashboard");
    }
  }
  const gradientBg = "linear-gradient(160deg, #9de0d8 0%, #b8eae4 30%, #cff2ee 60%, #e0f7f5 100%)";

  return (
    <div className="min-h-screen relative" style={{ background: gradientBg }}>
      {/* ページ全体のガラスバブル装飾（スクロールに連動） */}
      <div className="absolute inset-0 min-h-full overflow-hidden pointer-events-none z-0">
        {/* 左上 */}
        <div
          className="absolute -top-16 -left-16 w-52 h-52 md:w-72 md:h-72 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(180,235,230,0.25) 50%, rgba(140,215,210,0.1) 100%)",
            boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
            border: "1.5px solid rgba(255,255,255,0.45)",
          }}
        />
        {/* 右下 */}
        <div
          className="absolute -bottom-20 -right-20 w-60 h-60 md:w-80 md:h-80 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(180,235,230,0.2) 50%, rgba(140,215,210,0.08) 100%)",
            boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
            border: "1.5px solid rgba(255,255,255,0.4)",
          }}
        />
        {/* 右上 */}
        <div
          className="absolute top-8 -right-8 w-28 h-28 md:w-40 md:h-40 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(180,235,230,0.25) 55%, rgba(140,215,210,0.08) 100%)",
            boxShadow: "inset -3px -3px 8px rgba(255,255,255,0.45), inset 2px 2px 6px rgba(100,200,195,0.15)",
            border: "1.5px solid rgba(255,255,255,0.5)",
          }}
        />
        {/* 左中央 */}
        <div
          className="absolute top-1/2 -left-6 w-16 h-16 md:w-24 md:h-24 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.3) 55%, transparent 100%)",
            boxShadow: "inset -2px -2px 6px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(100,200,195,0.1)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        />
        {/* 極小 - 右上 */}
        <div
          className="absolute top-1/3 right-[12%] w-8 h-8 md:w-12 md:h-12 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, rgba(180,235,230,0.3) 60%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        />
        {/* 極小 - 左下 */}
        <div
          className="absolute bottom-16 left-[20%] w-6 h-6 md:w-9 md:h-9 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.25) 60%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        />
        {/* 中サイズ - 中央下 */}
        <div
          className="absolute bottom-[30%] left-[5%] w-24 h-24 md:w-32 md:h-32 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(180,235,230,0.2) 55%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        />
        {/* 中サイズ - 右中央 */}
        <div
          className="absolute top-[60%] right-[8%] w-20 h-20 md:w-28 md:h-28 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(180,235,230,0.22) 55%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.45)",
          }}
        />
        {/* スパークル */}
        <div className="absolute top-16 left-[40%] text-white/50 text-xs select-none">+</div>
        <div className="absolute top-28 right-[30%] text-white/40 text-[10px] select-none">✦</div>
        <div className="absolute bottom-24 right-[20%] text-white/45 text-xs select-none">+</div>
        <div className="absolute top-[45%] left-[25%] text-white/35 text-[10px] select-none">✦</div>
        <div className="absolute bottom-[40%] right-[35%] text-white/40 text-xs select-none">+</div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#9de0d8]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-serif text-lg md:text-xl tracking-wide" style={{ color: "#0d4f4a" }}>
              cosmepik
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.15em]" style={{ color: "#1a6b66" }}>
            <Link href="#concept" className="hover:opacity-80 transition-opacity" style={{ color: "#0d4f4a" }}>
              CONCEPT
            </Link>
            <Link href="#features" className="hover:opacity-80 transition-opacity" style={{ color: "#0d4f4a" }}>
              FEATURES
            </Link>
            <Link href="#start" className="hover:opacity-80 transition-opacity" style={{ color: "#0d4f4a" }}>
              START
            </Link>
          </nav>
          <LandingHeaderActions />
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-6 md:pt-32 md:pb-16 overflow-hidden z-10">
          <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <p
                className="text-[10px] md:text-xs tracking-[0.2em] mb-3 md:mb-4 font-medium"
                style={{ color: "#1a6b66" }}
              >
                COSME PROFILE LINK
              </p>
              <h1
                className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.15] mb-4 md:mb-6"
                style={{
                  color: "#0d4f4a",
                  textShadow: "0 2px 12px rgba(255,255,255,0.5)",
                }}
              >
                一軍コスメを
                <br />
                ファンに<span className="italic" style={{ color: "#2a8a84" }}>シェア</span>
              </h1>

              <p
                className="text-sm md:text-base leading-[1.7] mb-6 md:mb-8"
                style={{ color: "#1a6b66" }}
              >
                お気に入りのコスメやスキンケアルーティンを
                <br className="hidden sm:block" />
                1つのリンクにまとめて共有できます。
              </p>

              {/* Linktree風：URL入力＋CTA */}
              <HeroLinkInput />
              <p className="text-xs mt-3" style={{ color: "#2a8a84" }}>
                登録無料 / クレジットカード不要
              </p>

              {/* LEARN MORE */}
              <div className="flex mt-8 justify-center">
                <Link
                  href="#concept"
                  className="group inline-flex items-center gap-2 text-xs tracking-[0.15em] transition-colors"
                  style={{ color: "#1a6b66" }}
                >
                  <span
                    className="border-b pb-0.5 group-hover:border-[#0d4f4a] transition-colors"
                    style={{ borderColor: "rgba(26,107,102,0.5)" }}
                  >
                    LEARN MORE
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* スライドショー - Linktree風・iPhoneモックが流れる */}
          <HeroSlideshow />
        </section>

        {/* Concept Section */}
        <section id="concept" className="py-16 md:py-32 relative">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-5 order-2 md:order-1">
                <p className="text-[10px] tracking-[0.3em] mb-3 md:mb-4 font-medium" style={{ color: "#1a6b66" }}>
                  CONCEPT
                </p>
                <h2 className="font-serif text-2xl md:text-4xl font-light leading-[1.2] mb-4 md:mb-6" style={{ color: "#0d4f4a" }}>
                  コスメ好きのための
                  <br />
                  <span className="italic" style={{ color: "#2a8a84" }}>リンクツール</span>
                </h2>
                <p className="text-xs md:text-sm leading-[1.9] md:leading-[2]" style={{ color: "#1a6b66" }}>
                  「何使ってる？」「ルーティン教えて」
                  <br />
                  そんな質問に、リンク1つで答えられる。
                  <br />
                  <br className="hidden md:block" />
                  スキンケアルーティン、お気に入りコスメ、
                  <br className="hidden md:block" />
                  肌質やパーソナルカラーまで。
                  <br className="hidden md:block" />
                  あなたの美容情報をひとつにまとめて共有。
                </p>
              </div>
              <div className="md:col-span-6 md:col-start-7 order-1 md:order-2">
                <div className="relative w-full aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-muted">
                  <img
                    src="/images/cosmetics-hero.jpg"
                    alt="韓国コスメとスキンケア商品"
                    className="block w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-32 relative">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <p className="text-[10px] tracking-[0.3em] mb-3 md:mb-4 font-medium" style={{ color: "#1a6b66" }}>
                FEATURES
              </p>
              <h2 className="font-serif text-2xl md:text-4xl font-light" style={{ color: "#0d4f4a" }}>
                できること
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {[
                {
                  num: "01",
                  title: "スキンケアルーティン",
                  subtitle: "ROUTINE",
                  desc: "朝・夜のスキンケア手順をステップ形式で分かりやすく共有",
                },
                {
                  num: "02",
                  title: "お気に入りコスメ",
                  subtitle: "FAVORITES",
                  desc: "愛用アイテムをグリッドでまとめておしゃれにコレクション",
                },
                {
                  num: "03",
                  title: "ビューティープロフィール",
                  subtitle: "PROFILE",
                  desc: "肌質・パーソナルカラー・SNSリンクをひとつにまとめる",
                },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] tracking-[0.2em] mb-1 md:mb-2 font-medium" style={{ color: "#1a6b66" }}>
                    {feature.subtitle}
                  </p>
                  <p className="font-serif text-4xl md:text-5xl font-light mb-3 md:mb-4" style={{ color: "rgba(13,79,74,0.25)" }}>
                    {feature.num}
                  </p>
                  <h3 className="text-sm md:text-base font-medium mb-2 md:mb-3" style={{ color: "#0d4f4a" }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-[1.8]" style={{ color: "#1a6b66" }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section id="start" className="py-16 md:py-32 relative">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <p className="text-[10px] tracking-[0.3em] mb-3 md:mb-4 font-medium" style={{ color: "#1a6b66" }}>
                  HOW TO START
                </p>
                <h2 className="font-serif text-2xl md:text-4xl font-light leading-[1.2]" style={{ color: "#0d4f4a" }}>
                  始め方は
                  <br />
                  <span className="italic" style={{ color: "#2a8a84" }}>シンプル</span>
                </h2>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <div className="space-y-8 md:space-y-10">
                  {[
                    {
                      step: "01",
                      title: "アカウントを作成",
                      desc: "メールアドレスで無料登録。30秒で完了。",
                    },
                    {
                      step: "02",
                      title: "プロフィールを設定",
                      desc: "肌質やパーソナルカラー、SNSリンクを追加。",
                    },
                    {
                      step: "03",
                      title: "コスメを追加",
                      desc: "お気に入りのアイテムやルーティンを登録。",
                    },
                    {
                      step: "04",
                      title: "リンクをシェア",
                      desc: "InstagramやXのプロフィールに貼るだけ。",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 md:gap-6 items-start group"
                    >
                      <span className="font-serif text-2xl md:text-3xl font-light transition-colors group-hover:opacity-100" style={{ color: "rgba(42,138,132,0.6)" }}>
                        {item.step}
                      </span>
                      <div className="pt-0.5 md:pt-1">
                        <h3 className="text-sm font-medium mb-0.5 md:mb-1" style={{ color: "#0d4f4a" }}>
                          {item.title}
                        </h3>
                        <p className="text-xs" style={{ color: "#1a6b66" }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-32 relative">
          <div className="mx-auto max-w-2xl px-4 md:px-6 text-center">
            <p className="text-[10px] tracking-[0.3em] mb-3 md:mb-4 font-medium" style={{ color: "#1a6b66" }}>
              GET STARTED
            </p>
            <h2 className="font-serif text-2xl md:text-4xl font-light mb-4 md:mb-6" style={{ color: "#0d4f4a" }}>
              今すぐ始めよう
            </h2>
            <p className="text-xs md:text-sm mb-8 md:mb-10" style={{ color: "#1a6b66" }}>
              登録無料。クレジットカード不要。
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full px-8 md:px-10 py-3.5 md:py-4 text-sm tracking-[0.1em] font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: "#ffffff",
                color: "#0d4f4a",
                boxShadow: "0 4px 24px rgba(13,79,74,0.2)",
              }}
            >
              コスメリンクを作成
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#b8eae4]/50 bg-[#e0f7f5]/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg tracking-wide" style={{ color: "#0d4f4a" }}>
                cosmepik
              </span>
            </div>
            <nav className="flex flex-wrap gap-4 md:gap-6 text-[10px] tracking-[0.15em]">
              <Link href="/guide" className="hover:opacity-80 transition-opacity" style={{ color: "#1a6b66" }}>
                ABOUT
              </Link>
              <Link href="/faq" className="hover:opacity-80 transition-opacity" style={{ color: "#1a6b66" }}>
                TERMS
              </Link>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: "#1a6b66" }}>
                PRIVACY
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "#1a6b66" }}>
                CONTACT
              </Link>
            </nav>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t text-center md:text-left text-[10px] tracking-[0.1em]" style={{ borderColor: "rgba(26,107,102,0.3)", color: "#1a6b66" }}>
            &copy; 2026 cosmepik. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
