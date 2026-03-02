# cosmepik ヒーローセクション背景実装ガイド

## 概要

Anua（韓国コスメブランド）のビジュアルスタイルを参考にした、ミント/ティールのグラデーション背景と半透明ガラスバブルのデザイン。

---

## 1. セクション背景グラデーション

ミント〜ティールの4段階グラデーションを160度の角度で適用。

```tsx
<section
  className="relative pt-20 pb-6 md:pt-32 md:pb-16 overflow-hidden"
  style={{
    background: "linear-gradient(160deg, #9de0d8 0%, #b8eae4 30%, #cff2ee 60%, #e0f7f5 100%)"
  }}
>
```

### カラーパレット
- `#9de0d8` - 濃いミント（上部）
- `#b8eae4` - ミント
- `#cff2ee` - 薄いミント
- `#e0f7f5` - 最も薄いミント（下部）

---

## 2. ガラスバブル装飾

### バブルの基本構造

半透明のガラス玉エフェクトは以下の3要素で構成：

1. **radial-gradient**: 光の反射を表現（左上から明るく）
2. **inset box-shadow**: 内側の光沢と影
3. **border**: 微細な白い輪郭

### 大きいバブル（左上）

```tsx
<div
  className="absolute -top-16 -left-16 w-52 h-52 md:w-72 md:h-72 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(180,235,230,0.25) 50%, rgba(140,215,210,0.1) 100%)",
    boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
    border: "1.5px solid rgba(255,255,255,0.45)"
  }}
/>
```

### 大きいバブル（右下）

```tsx
<div
  className="absolute -bottom-20 -right-20 w-60 h-60 md:w-80 md:h-80 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(180,235,230,0.2) 50%, rgba(140,215,210,0.08) 100%)",
    boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
    border: "1.5px solid rgba(255,255,255,0.4)"
  }}
/>
```

### 中サイズバブル（右上）

```tsx
<div
  className="absolute top-8 -right-8 w-28 h-28 md:w-40 md:h-40 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(180,235,230,0.25) 55%, rgba(140,215,210,0.08) 100%)",
    boxShadow: "inset -3px -3px 8px rgba(255,255,255,0.45), inset 2px 2px 6px rgba(100,200,195,0.15)",
    border: "1.5px solid rgba(255,255,255,0.5)"
  }}
/>
```

### 小サイズバブル（左中央）

```tsx
<div
  className="absolute top-1/2 -left-6 w-16 h-16 md:w-24 md:h-24 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.3) 55%, transparent 100%)",
    boxShadow: "inset -2px -2px 6px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(100,200,195,0.1)",
    border: "1px solid rgba(255,255,255,0.55)"
  }}
/>
```

### 極小バブル（アクセント用）

```tsx
{/* 右上エリア */}
<div
  className="absolute top-1/3 right-[12%] w-8 h-8 md:w-12 md:h-12 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, rgba(180,235,230,0.3) 60%, transparent 100%)",
    border: "1px solid rgba(255,255,255,0.6)"
  }}
/>

{/* 左下エリア */}
<div
  className="absolute bottom-16 left-[20%] w-6 h-6 md:w-9 md:h-9 rounded-full"
  style={{
    background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.25) 60%, transparent 100%)",
    border: "1px solid rgba(255,255,255,0.55)"
  }}
/>
```

### スパークル（キラキラ）

```tsx
<div className="absolute top-16 left-[40%] text-white/50 text-xs select-none">+</div>
<div className="absolute top-28 right-[30%] text-white/40 text-[10px] select-none">✦</div>
<div className="absolute bottom-24 right-[20%] text-white/45 text-xs select-none">+</div>
```

---

## 3. テキストスタイル

ミント背景に対してコントラストを確保するため、濃いティールグリーンを使用。

### カラー定義

| 用途 | カラーコード | 説明 |
|------|-------------|------|
| 見出し | `#0d4f4a` | 最も濃いティール |
| 本文 | `#1a6b66` | 濃いティール |
| アクセント | `#2a8a84` | 中間ティール |

### サブタイトル

```tsx
<p 
  className="text-[10px] md:text-xs tracking-[0.2em] mb-3 md:mb-4 font-medium"
  style={{ color: "#1a6b66" }}
>
  COSME PROFILE LINK
</p>
```

### メイン見出し

```tsx
<h1 
  className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.15] mb-4 md:mb-6"
  style={{ 
    color: "#0d4f4a",
    textShadow: "0 2px 12px rgba(255,255,255,0.5)"
  }}
>
  一軍コスメを
  <br />
  ファンに<span className="italic" style={{ color: "#2a8a84" }}>シェア</span>
</h1>
```

**ポイント:**
- `textShadow: "0 2px 12px rgba(255,255,255,0.5)"` で白い影を追加し、背景から浮き上がらせる
- 「シェア」部分はアクセントカラー `#2a8a84` でイタリック

### 説明文

```tsx
<p 
  className="text-sm md:text-base leading-[1.7] mb-6 md:mb-8"
  style={{ color: "#1a6b66" }}
>
  お気に入りのコスメやスキンケアルーティンを
  <br className="hidden sm:block" />
  1つのリンクにまとめて共有できます。
</p>
```

---

## 4. CTAボタン

白背景に濃いティール文字で、グラデーション背景上での視認性を確保。

```tsx
<Link 
  href="/signup"
  className="inline-flex items-center justify-center rounded-full px-8 md:px-10 py-3.5 md:py-4 text-sm md:text-base font-semibold transition-all hover:scale-[1.02]"
  style={{
    background: "#ffffff",
    color: "#0d4f4a",
    boxShadow: "0 4px 24px rgba(13,79,74,0.2)"
  }}
>
  無料でページを作成
</Link>
```

### 補足テキスト

```tsx
<p className="text-xs mt-3" style={{ color: "#2a8a84" }}>
  登録無料 / クレジットカード不要
</p>
```

---

## 5. 完全なコード例

```tsx
{/* Hero Section */}
<section
  className="relative pt-20 pb-6 md:pt-32 md:pb-16 overflow-hidden"
  style={{
    background: "linear-gradient(160deg, #9de0d8 0%, #b8eae4 30%, #cff2ee 60%, #e0f7f5 100%)"
  }}
>
  {/* Glass bubble decorations */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Large glass bubble - top left */}
    <div
      className="absolute -top-16 -left-16 w-52 h-52 md:w-72 md:h-72 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, rgba(180,235,230,0.25) 50%, rgba(140,215,210,0.1) 100%)",
        boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
        border: "1.5px solid rgba(255,255,255,0.45)"
      }}
    />
    {/* Large glass bubble - bottom right */}
    <div
      className="absolute -bottom-20 -right-20 w-60 h-60 md:w-80 md:h-80 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(180,235,230,0.2) 50%, rgba(140,215,210,0.08) 100%)",
        boxShadow: "inset -4px -4px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(100,200,195,0.15)",
        border: "1.5px solid rgba(255,255,255,0.4)"
      }}
    />
    {/* Medium glass bubble - top right */}
    <div
      className="absolute top-8 -right-8 w-28 h-28 md:w-40 md:h-40 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(180,235,230,0.25) 55%, rgba(140,215,210,0.08) 100%)",
        boxShadow: "inset -3px -3px 8px rgba(255,255,255,0.45), inset 2px 2px 6px rgba(100,200,195,0.15)",
        border: "1.5px solid rgba(255,255,255,0.5)"
      }}
    />
    {/* Small glass bubble - mid left */}
    <div
      className="absolute top-1/2 -left-6 w-16 h-16 md:w-24 md:h-24 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.3) 55%, transparent 100%)",
        boxShadow: "inset -2px -2px 6px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(100,200,195,0.1)",
        border: "1px solid rgba(255,255,255,0.55)"
      }}
    />
    {/* Tiny bubble accents */}
    <div
      className="absolute top-1/3 right-[12%] w-8 h-8 md:w-12 md:h-12 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, rgba(180,235,230,0.3) 60%, transparent 100%)",
        border: "1px solid rgba(255,255,255,0.6)"
      }}
    />
    <div
      className="absolute bottom-16 left-[20%] w-6 h-6 md:w-9 md:h-9 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.65) 0%, rgba(180,235,230,0.25) 60%, transparent 100%)",
        border: "1px solid rgba(255,255,255,0.55)"
      }}
    />
    {/* Star sparkles */}
    <div className="absolute top-16 left-[40%] text-white/50 text-xs select-none">+</div>
    <div className="absolute top-28 right-[30%] text-white/40 text-[10px] select-none">✦</div>
    <div className="absolute bottom-24 right-[20%] text-white/45 text-xs select-none">+</div>
  </div>

  <div className="relative mx-auto max-w-6xl px-4 md:px-6">
    <div className="text-center max-w-2xl mx-auto">
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
          textShadow: "0 2px 12px rgba(255,255,255,0.5)"
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

      {/* CTA Button */}
      <Link 
        href="/signup"
        className="inline-flex items-center justify-center rounded-full px-8 md:px-10 py-3.5 md:py-4 text-sm md:text-base font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: "#ffffff",
          color: "#0d4f4a",
          boxShadow: "0 4px 24px rgba(13,79,74,0.2)"
        }}
      >
        無料でページを作成
      </Link>
      <p className="text-xs mt-3" style={{ color: "#2a8a84" }}>
        登録無料 / クレジットカード不要
      </p>
    </div>
  </div>
</section>
```

---

## デザインのポイント

1. **グラスモーフィズム**: `radial-gradient` + `inset box-shadow` + 半透明 `border` の組み合わせでガラス玉のような質感を表現
2. **光の位置統一**: すべてのバブルで `circle at 35% 35%` を使用し、光源を左上に統一
3. **レスポンシブ対応**: `md:` プレフィックスでモバイル/デスクトップのサイズを分岐
4. **テキスト可読性**: 濃いティールグリーン + 白い textShadow でグラデーション背景上での視認性を確保
