# ランディングページ デザイン修正

## 問題点

1. **コンセプトセクションの画像が表示されない**: `/images/cosmetics-hero.jpg` が存在しないか読み込めない
2. **レイアウトの調整が必要**: モバイルでの余白やサイズの微調整

---

## 修正1: 画像の代わりにグラデーションプレースホルダーを使用

画像ファイルがない場合は、オシャレなグラデーションプレースホルダーを使用します。

### コンセプトセクションの画像部分を以下に置き換え:

```tsx
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
        {/* グラデーションプレースホルダー（画像の代わり） */}
        <div 
          className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #e8f4f4 0%, #f0e8f0 50%, #e8f0f4 100%)"
          }}
        >
          {/* デコレーション要素 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 md:gap-4 p-6 md:p-8">
              {/* コスメアイコン風の装飾 */}
              <div className="w-12 h-16 md:w-16 md:h-20 rounded-full bg-white/60 shadow-sm" />
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white/60 shadow-sm mt-4" />
              <div className="w-12 h-14 md:w-16 md:h-18 rounded-full bg-white/60 shadow-sm" />
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/20 shadow-sm" />
              <div className="w-12 h-16 md:w-16 md:h-20 rounded-lg bg-white/60 shadow-sm" />
              <div className="w-10 h-12 md:w-14 md:h-16 rounded-full bg-primary/20 shadow-sm mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 修正2: 画像を使用する場合

画像を使用したい場合は、以下の手順で画像を追加してください:

### 手順:

1. `public/images/` フォルダを作成（存在しない場合）
2. コスメの画像を `cosmetics-hero.jpg` という名前で保存
3. 以下のコードを使用:

```tsx
<div className="md:col-span-6 md:col-start-7 order-1 md:order-2">
  <div className="aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-secondary">
    <img 
      src="/images/cosmetics-hero.jpg" 
      alt="韓国コスメとスキンケア商品" 
      className="w-full h-full object-cover"
      onError={(e) => {
        // 画像読み込み失敗時のフォールバック
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement!.style.background = 
          'linear-gradient(135deg, #e8f4f4 0%, #f0e8f0 50%, #e8f0f4 100%)';
      }}
    />
  </div>
</div>
```

---

## 修正3: ヒーローセクションのモバイルレイアウト調整

モバイルでCTAボタンとスマホモックアップが適切に表示されるよう調整:

```tsx
{/* Hero Section */}
<section className="relative min-h-[100svh] pt-14 flex flex-col overflow-x-hidden">
  <div className="mx-auto w-full max-w-6xl px-4 md:px-6 flex-1 flex flex-col">
    <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 flex-1">
      
      {/* Title + CTA */}
      <div className="pt-4 pb-3 md:pt-24 md:pb-12 md:col-span-5 flex flex-col shrink-0">
        <p className="text-[10px] tracking-[0.3em] text-primary mb-2 md:mb-4">
          COSME PROFILE LINK
        </p>
        <h1 className="font-serif text-[22px] md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.3]">
          一軍コスメを
          <br />
          ファンに<span className="italic">シェア</span>
        </h1>
        <p className="mt-3 md:mt-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
          あなたのお気に入りコスメや
          <br />
          スキンケアルーティンを
          <br />
          1つのリンクにまとめて共有。
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-4 md:mt-8 flex flex-col gap-2 md:gap-3">
          <Link
            href="/p/demo"
            className="inline-flex h-12 md:h-14 w-full md:w-auto items-center justify-center rounded-full bg-primary px-6 md:px-8 text-sm md:text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
          >
            無料でページを作成
          </Link>
          <p className="text-center md:text-left text-[10px] md:text-xs text-muted-foreground">
            登録無料 / クレジットカード不要
          </p>
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
            {/* Notch */}
            <div className="absolute left-1/2 top-0 h-4 w-16 md:h-6 md:w-24 -translate-x-1/2 rounded-b-lg md:rounded-b-2xl bg-gray-900 z-10" />
            
            {/* Screen */}
            <div className="overflow-hidden rounded-[23px] md:rounded-[32px] bg-white">
              <div 
                className="w-full"
                style={{
                  background: "linear-gradient(135deg, #d4f5f5 0%, #f2ebf5 100%)"
                }}
              >
                {/* Profile Content - 省略（元のコードを使用） */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 修正4: globals.css の確認

以下のCSS変数が正しく設定されているか確認:

```css
:root {
  --background: oklch(0.98 0.008 190);
  --foreground: oklch(0.2 0.02 190);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.02 190);
  --primary: oklch(0.7 0.1 190);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0.018 190);
  --secondary-foreground: oklch(0.3 0.04 190);
  --muted: oklch(0.96 0.015 190);
  --muted-foreground: oklch(0.5 0.02 190);
  --border: oklch(0.92 0.015 190);
}
```

---

## 修正5: フォント設定の確認

layout.tsx に以下のフォント設定があるか確認:

```tsx
import { Noto_Sans_JP, Cormorant_Garamond } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif" 
});

// body tag:
<body className={`${notoSansJP.variable} ${cormorant.variable} font-sans antialiased`}>
```

globals.css に以下を追加:

```css
@theme inline {
  --font-sans: var(--font-sans, 'Noto Sans JP', sans-serif);
  --font-serif: var(--font-serif, 'Cormorant Garamond', serif);
}
```

---

## チェックリスト

- [ ] `public/images/` フォルダが存在するか確認
- [ ] 画像を使用するか、グラデーションプレースホルダーを使用するか決定
- [ ] globals.css のカラー変数を確認
- [ ] layout.tsx のフォント設定を確認
- [ ] モバイルでCTAボタンがスクロールなしで見えるか確認
