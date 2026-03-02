# cosmepik ランディングページ実装指示書

## 概要

コスメ共有サービス「cosmepik」のランディングページを実装する。
OPERAのような、余白を活かしたミニマルでエレガントなデザイン。
モバイルファーストで、特にiPhoneでの表示崩れがないように実装する。

---

## デザインコンセプト

- **テーマ**: ミントスパークル（ミントティール #56c8c8 をプライマリカラー）
- **背景**: オフホワイト #faf9f7
- **フォント**: 見出しにセリフ体（Cormorant Garamond）、本文にゴシック体（Noto Sans JP）
- **特徴**: 大量の余白、細いレタースペーシング、非対称グリッドレイアウト

---

## 必要なファイル

### 1. app/globals.css - カラーテーマ

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.98 0.008 190);
  --foreground: oklch(0.2 0.02 190);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 190);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0.02 190);
  --primary: oklch(0.7 0.1 190);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0.018 190);
  --secondary-foreground: oklch(0.3 0.04 190);
  --muted: oklch(0.96 0.015 190);
  --muted-foreground: oklch(0.5 0.02 190);
  --accent: oklch(0.92 0.035 190);
  --accent-foreground: oklch(0.3 0.04 190);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.015 190);
  --input: oklch(0.92 0.015 190);
  --ring: oklch(0.7 0.1 190);
  --radius: 0.75rem;
}

@theme inline {
  --font-sans: var(--font-sans, 'Noto Sans JP', sans-serif);
  --font-serif: var(--font-serif, 'Cormorant Garamond', serif);
  --font-mono: var(--font-mono, 'Geist Mono', monospace);
  /* ... 他のテーマ変数 */
}
```

### 2. app/layout.tsx - フォント設定

```tsx
import { Noto_Sans_JP, Geist_Mono, Cormorant_Garamond } from 'next/font/google'

const _notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const _cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif" 
});

export const viewport: Viewport = {
  themeColor: '#56c8c8',
  width: 'device-width',
  initialScale: 1,
}

// body に全フォント変数を追加
<body className={`${_notoSansJP.variable} ${_geistMono.variable} ${_cormorant.variable} font-sans antialiased`}>
```

### 3. components/icons/x-icon.tsx - Xアイコン

```tsx
export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
```

### 4. app/page.tsx - ランディングページ本体

```tsx
import Link from "next/link"
import { Leaf, ChevronRight, Instagram, Youtube } from "lucide-react"
import { XIcon } from "@/components/icons/x-icon"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="flex items-center gap-1.5">
            <Leaf className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span className="font-serif text-lg md:text-xl tracking-wide text-foreground">cosmepik</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.15em] text-muted-foreground">
            <Link href="#concept" className="hover:text-foreground transition-colors">CONCEPT</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">FEATURES</Link>
            <Link href="#start" className="hover:text-foreground transition-colors">START</Link>
          </nav>
          <Link 
            href="/signup"
            className="text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors"
          >
            SIGN UP
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section - Mobile First */}
        <section className="relative min-h-[100svh] pt-14 flex flex-col overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6 flex-1 flex flex-col">
            <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 flex-1">
              
              {/* Title + CTA - Always visible on mobile */}
              <div className="pt-4 pb-3 md:pt-24 md:pb-12 md:col-span-5 flex flex-col shrink-0">
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-2 md:mb-4">COSME PROFILE LINK</p>
                <h1 className="font-serif text-[22px] md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.3]">
                  一軍コスメを
                  <br />
                  ファンに<span className="italic">シェア</span>
                </h1>
                
                <p className="text-xs md:text-sm text-muted-foreground leading-[1.8] mt-4 md:mt-6">
                  あなたのお気に入りコスメや<br className="md:hidden" />
                  スキンケアルーティンを<br />
                  1つのリンクにまとめて共有。
                </p>

                {/* CTA Button - Prominent on mobile */}
                <div className="mt-5 md:mt-8">
                  <Link 
                    href="/signup"
                    className="inline-flex items-center justify-center w-full md:w-auto rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    無料でページを作成
                  </Link>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center md:text-left">
                    登録無料 / クレジットカード不要
                  </p>
                </div>

                {/* Desktop: Additional link */}
                <div className="hidden md:flex mt-6">
                  <Link 
                    href="#concept"
                    className="group inline-flex items-center gap-2 text-xs tracking-[0.12em] text-muted-foreground hover:text-foreground"
                  >
                    <span className="border-b border-muted-foreground/50 pb-0.5 group-hover:border-foreground transition-colors">
                      LEARN MORE
                    </span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="flex-1 flex items-center justify-center md:col-span-7 py-2 md:py-0 min-h-0">
                <div className="relative w-full max-w-[200px] md:max-w-[280px]">
                  {/* Decorative gradient blob */}
                  <div 
                    className="absolute -top-6 -right-6 w-32 h-32 md:w-72 md:h-72 rounded-full opacity-50 blur-2xl md:blur-3xl -z-10"
                    style={{
                      background: "linear-gradient(135deg, #d4f5f5 0%, #f2ebf5 100%)"
                    }}
                  />
                  
                  {/* Phone Frame */}
                  <div className="relative mx-auto rounded-[28px] md:rounded-[40px] border-[5px] md:border-[8px] border-gray-900 bg-gray-900 shadow-2xl">
                    <div className="absolute left-1/2 top-0 h-4 w-16 md:h-6 md:w-24 -translate-x-1/2 rounded-b-lg md:rounded-b-2xl bg-gray-900" />
                    <div className="overflow-hidden rounded-[23px] md:rounded-[32px] bg-white">
                      <div 
                        className="w-full"
                        style={{
                          background: "linear-gradient(180deg, #e8f8f8 0%, #f5f0f8 100%)"
                        }}
                      >
                        {/* Profile Content - モバイルで縮小 */}
                        <div className="flex flex-col items-center px-3 pt-4 pb-4 md:px-5 md:pt-8 md:pb-6">
                          {/* Logo */}
                          <div className="flex items-center gap-1 mb-3 md:mb-6">
                            <Leaf className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-primary" />
                            <span className="font-serif text-[8px] md:text-xs tracking-wide text-foreground">cosmepik</span>
                          </div>
                          
                          {/* Avatar */}
                          <div className="relative mb-1.5 md:mb-3">
                            <div className="h-12 w-12 md:h-20 md:w-20 rounded-full border-2 md:border-[3px] border-primary p-0.5">
                              <div className="h-full w-full rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                                <span className="font-serif text-base md:text-2xl text-primary/50">M</span>
                              </div>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded-full bg-primary text-[6px] md:text-[10px] font-medium text-primary-foreground">
                              K
                            </div>
                          </div>
                          
                          <p className="font-medium text-[10px] md:text-sm text-foreground">@mina_kbeauty</p>
                          <p className="mt-0.5 text-[8px] md:text-[11px] text-muted-foreground">韓国コスメ好き</p>
                          
                          {/* SNS Icons */}
                          <div className="mt-2 md:mt-4 flex items-center gap-1 md:gap-2">
                            {[Instagram, XIcon, Youtube].map((Icon, i) => (
                              <div key={i} className="flex h-5 w-5 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-white">
                                <Icon className="h-2.5 w-2.5 md:h-4 md:w-4 text-foreground" />
                              </div>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="mt-2.5 md:mt-5 flex w-full items-center justify-center rounded-lg md:rounded-2xl bg-white p-2 md:p-3.5 shadow-sm">
                            <div className="flex-1 text-center border-r border-border">
                              <p className="text-[10px] md:text-base font-semibold text-foreground">24</p>
                              <p className="text-[6px] md:text-[10px] text-muted-foreground">アイテム</p>
                            </div>
                            <div className="flex-1 text-center border-r border-border">
                              <p className="text-[10px] md:text-base font-semibold text-foreground">1.2K</p>
                              <p className="text-[6px] md:text-[10px] text-muted-foreground">フォロワー</p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-[10px] md:text-base font-semibold text-foreground">856</p>
                              <p className="text-[6px] md:text-[10px] text-muted-foreground">いいね</p>
                            </div>
                          </div>

                          {/* Routine Preview */}
                          <div className="mt-2.5 md:mt-4 w-full text-left">
                            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                              <span className="flex h-3.5 w-6 md:h-5 md:w-8 items-center justify-center rounded bg-primary text-[6px] md:text-[9px] font-semibold text-primary-foreground">AM</span>
                              <span className="text-[8px] md:text-xs font-semibold text-foreground">朝のルーティン</span>
                            </div>
                            <div className="rounded-lg md:rounded-2xl bg-white p-2 md:p-3 shadow-sm">
                              <div className="flex items-center gap-1.5 md:gap-3">
                                <div className="flex h-3.5 w-3.5 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary/10 text-[6px] md:text-[9px] font-semibold text-primary shrink-0">1</div>
                                <div className="h-6 w-6 md:h-10 md:w-10 rounded-md md:rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0">
                                  <div className="h-4 w-2 md:h-7 md:w-4 rounded-sm bg-primary/30" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[6px] md:text-[9px] font-medium text-primary tracking-wide">INNISFREE</p>
                                  <p className="text-[7px] md:text-[11px] font-medium text-foreground truncate">グリーンティー クレンザー</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Concept Section */}
        <section id="concept" className="py-16 md:py-32 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-5 order-2 md:order-1">
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 md:mb-4">CONCEPT</p>
                <h2 className="font-serif text-2xl md:text-4xl font-light text-foreground leading-[1.2] mb-4 md:mb-6">
                  コスメ好きのための
                  <br />
                  <span className="italic">リンクツール</span>
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground leading-[1.9] md:leading-[2]">
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
                <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden">
                  <img 
                    src="/images/cosmetics-hero.jpg" 
                    alt="韓国コスメとスキンケア商品" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-32 bg-[#faf9f7]">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 md:mb-4">FEATURES</p>
              <h2 className="font-serif text-2xl md:text-4xl font-light text-foreground">
                できること
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {[
                {
                  num: "01",
                  title: "スキンケアルーティン",
                  subtitle: "ROUTINE",
                  desc: "朝・夜のスキンケア手順をステップ形式で分かりやすく共有"
                },
                {
                  num: "02",
                  title: "お気に入りコスメ",
                  subtitle: "FAVORITES",
                  desc: "愛用アイテムをグリッドでまとめておしゃれにコレクション"
                },
                {
                  num: "03",
                  title: "ビューティープロフィール",
                  subtitle: "PROFILE",
                  desc: "肌質・パーソナルカラー・SNSリンクをひとつにまとめる"
                }
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1 md:mb-2">{feature.subtitle}</p>
                  <p className="font-serif text-4xl md:text-5xl font-light text-primary/20 mb-3 md:mb-4">{feature.num}</p>
                  <h3 className="text-sm md:text-base font-medium text-foreground mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-[1.8]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section id="start" className="py-16 md:py-32 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4">
                <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 md:mb-4">HOW TO START</p>
                <h2 className="font-serif text-2xl md:text-4xl font-light text-foreground leading-[1.2]">
                  始め方は
                  <br />
                  <span className="italic">シンプル</span>
                </h2>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <div className="space-y-8 md:space-y-10">
                  {[
                    { step: "01", title: "アカウントを作成", desc: "メールアドレスで無料登録。30秒で完了。" },
                    { step: "02", title: "プロフィールを設定", desc: "肌質やパーソナルカラー、SNSリンクを追加。" },
                    { step: "03", title: "コスメを追加", desc: "お気に入りのアイテムやルーティンを登録。" },
                    { step: "04", title: "リンクをシェア", desc: "InstagramやXのプロフィールに貼るだけ。" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 items-start group">
                      <span className="font-serif text-2xl md:text-3xl font-light text-primary/30 group-hover:text-primary transition-colors">
                        {item.step}
                      </span>
                      <div className="pt-0.5 md:pt-1">
                        <h3 className="text-sm font-medium text-foreground mb-0.5 md:mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-32 bg-[#faf9f7]">
          <div className="mx-auto max-w-2xl px-4 md:px-6 text-center">
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 md:mb-4">GET STARTED</p>
            <h2 className="font-serif text-2xl md:text-4xl font-light text-foreground mb-4 md:mb-6">
              今すぐ始めよう
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-8 md:mb-10">
              完全無料。クレジットカード不要。
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 md:px-10 py-3.5 md:py-4 text-sm tracking-[0.1em] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              無料でページを作成
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-serif text-lg tracking-wide text-foreground">cosmepik</span>
            </div>
            <nav className="flex flex-wrap gap-4 md:gap-6 text-[10px] tracking-[0.15em] text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">ABOUT</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">TERMS</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">PRIVACY</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">CONTACT</Link>
            </nav>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center md:text-left text-[10px] tracking-[0.1em] text-muted-foreground">
            &copy; 2026 cosmepik. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
```

---

## モバイル対応のポイント

### 1. 100svh を使用
`min-h-[100svh]` でiPhoneのアドレスバーを考慮した高さを設定。

### 2. overflow-x-hidden
横スクロールを防止するため、セクションに `overflow-x-hidden` を追加。

### 3. shrink-0 でレイアウト崩れ防止
フレックスアイテムが縮小しないよう `shrink-0` を追加。

### 4. モバイル用のサイズ指定
すべての要素にモバイル用の小さいサイズを指定し、`md:` プレフィックスでデスクトップサイズを上書き:
- フォントサイズ: `text-[22px] md:text-4xl`
- パディング: `px-3 md:px-5`
- 角丸: `rounded-[28px] md:rounded-[40px]`

### 5. CTAボタンはファーストビューに
スクロールなしで「無料でページを作成」ボタンが見えるよう、ヒーローセクションの上部に配置。

---

## 必要な画像

`/public/images/cosmetics-hero.jpg` - コンセプトセクション用のコスメ画像を配置してください。
韓国コスメやスキンケア商品のフラットレイ写真が理想的です。

---

## セクション構成

1. **Header** - 固定ナビゲーション、ロゴ、SIGN UPリンク
2. **Hero** - タイトル「一軍コスメをファンにシェア」+ CTA + スマホモックアップ
3. **Concept** - サービス説明 + 画像
4. **Features** - 3つの機能紹介（ルーティン、お気に入り、プロフィール）
5. **How to Start** - 4ステップの始め方
6. **CTA** - 最終コンバージョン
7. **Footer** - リンク集、コピーライト
