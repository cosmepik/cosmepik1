# 楽天アフィリエイト登録手順ページ実装ガイド（Cursor向け）

## 変更ファイル一覧

| ファイル | 種別 |
|---|---|
| `app/guide/rakuten-affiliate/page.tsx` | 新規作成 |
| `app/page.tsx` | 修正（リンク追加） |

---

## 1. 新規作成: `app/guide/rakuten-affiliate/page.tsx`

```tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Copy, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CosmepikLogo } from "@/components/cosmepik-logo"

const steps = [
  {
    number: 1,
    title: "楽天アフィリエイトに登録する",
    description: "まずは楽天アフィリエイトの公式サイトでアカウントを作成します。",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5998-qFU2sbDVM2DdDZ6UtANzjmLbE2lbnE.jpg",
    imageAlt: "楽天アフィリエイトトップページ",
    substeps: [
      { text: "楽天アフィリエイト公式サイトにアクセス", link: "https://affiliate.rakuten.co.jp/" },
      { text: "「新規登録」をクリック（楽天IDをお持ちの方はログイン）" },
      { text: "氏名・住所・メールアドレス・銀行口座などを入力" },
      { text: "規約に同意して登録完了" },
    ],
    agreementImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6001-OxPXRotRoJJwx3NfHJK6qpmymkq9fn.jpg",
    agreementAlt: "規約同意画面",
  },
  {
    number: 2,
    title: "サイト情報を登録する",
    description: "cosmepikのURLを楽天アフィリエイトに登録します。これは必須の手順です。",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6003-E7hagvzAbym0By15cJSypwgpMUONrU.jpg",
    imageAlt: "サイドバーメニュー",
    substeps: [
      { text: "左上の三本線アイコンからサイドバーを開く" },
      { text: "「マイページ」→「サイト情報の登録」をクリック" },
      { text: "「追加登録」をクリック" },
    ],
    formImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6004-zT6cGyh7USkfKfvKC7H6cSEfrpNCfr.jpg",
    formAlt: "サイト情報登録フォーム",
    formFields: [
      { label: "運営サイト名", example: "cosmepik_あなたのユーザー名" },
      { label: "運営サイトURL", example: "https://cosmepik.com/p/あなたのユーザー名" },
      { label: "サイトのジャンル", example: "美容" },
      { label: "扱う商品ジャンル", example: "美容・コスメ・香水" },
    ],
    warning: "サイト情報の登録は必須です。未登録のままアフィリエイトリンクを掲載すると規約違反になる場合があります。",
  },
  {
    number: 3,
    title: "アフィリエイトIDを確認する",
    description: "あなた専用のアフィリエイトIDを取得します。",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6005-SMU6yezZdiCLzVghhmsdlt36jY3h7S.jpg",
    imageAlt: "アフィリエイトID確認ページ",
    substeps: [
      { text: "アフィリエイトID確認ページにアクセス", link: "https://webservice.rakuten.co.jp/account_affiliate_id/" },
      { text: "楽天アフィリエイトで使った楽天IDでログイン" },
      { text: "表示されたアフィリエイトIDをコピー" },
    ],
    idExample: "0ea12345.ab.cd",
  },
  {
    number: 4,
    title: "cosmepikでIDを設定する",
    description: "取得したアフィリエイトIDをcosmepikに設定すれば完了です。",
    substeps: [
      { text: "cosmepikにログイン" },
      { text: "サイドメニュー（≡）から「収益化」を開く" },
      { text: "楽天アフィリエイトID欄にIDを入力" },
      { text: "「保存」をクリック" },
    ],
    note: "設定したIDは、すべてのコスメセットに自動で適用されます。",
  },
]

function StepCard({ step, isLast }: { step: typeof steps[0]; isLast: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      {/* Step connector line */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/10" />
      )}

      <div className="relative flex gap-4">
        {/* Step number circle */}
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg">
          {step.number}
        </div>

        <div className="flex-1 pb-10">
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          {/* Main image */}
          {step.image && (
            <div className="relative mb-4 overflow-hidden rounded-xl border border-border shadow-sm max-w-[200px]">
              <Image
                src={step.image}
                alt={step.imageAlt || ""}
                width={200}
                height={150}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Substeps */}
          <ul className="space-y-2.5 mb-4">
            {step.substeps.map((substep, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ChevronRight className="h-3 w-3" />
                </div>
                <span className="text-sm text-foreground">
                  {substep.text}
                  {substep.link && (
                    <a
                      href={substep.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {/* Agreement image for step 1 */}
          {step.agreementImage && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">規約同意画面</p>
              <div className="relative overflow-hidden rounded-xl border border-border shadow-sm max-w-[200px]">
                <Image
                  src={step.agreementImage}
                  alt={step.agreementAlt || ""}
                  width={200}
                  height={150}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Form image and fields for step 2 */}
          {step.formImage && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">入力フォーム</p>
              <div className="relative overflow-hidden rounded-xl border border-border shadow-sm mb-4 max-w-[200px]">
                <Image
                  src={step.formImage}
                  alt={step.formAlt || ""}
                  width={200}
                  height={250}
                  className="w-full h-auto"
                />
              </div>

              {/* Form field examples */}
              <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground">入力例</p>
                {step.formFields?.map((field, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">{field.label}</span>
                    <code className="text-xs bg-background px-2 py-1.5 rounded-lg border border-border text-foreground">
                      {field.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for step 2 */}
          {step.warning && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">{step.warning}</p>
            </div>
          )}

          {/* ID example for step 3 */}
          {step.idExample && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">アフィリエイトIDの例</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-secondary px-3 py-2 rounded-lg border border-border font-mono text-primary">
                  {step.idExample}
                </code>
                <button
                  onClick={() => handleCopy(step.idExample!)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    copied ? "bg-green-500 text-white" : "bg-secondary hover:bg-accent text-foreground"
                  )}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Note for step 4 */}
          {step.note && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/10 p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="text-xs text-foreground">{step.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RakutenAffiliateGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>戻る</span>
          </Link>
          <CosmepikLogo className="h-5 w-auto" />
          <div className="w-14" />
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            収益化ガイド
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            楽天アフィリエイト<br />登録手順
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            cosmepikでコスメを紹介して収益を得るために、<br className="hidden sm:block" />
            楽天アフィリエイトの設定を完了しましょう。
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-primary/10 to-rose-500/10 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">収益の仕組み</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                あなたのcosmepikページ経由で楽天市場の商品が購入されると、売上の一部が成果報酬として受け取れます。登録・利用は完全無料です。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <div className="space-y-0">
          {steps.map((step, idx) => (
            <StepCard key={step.number} step={step} isLast={idx === steps.length - 1} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 px-8 py-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">設定完了!</h3>
              <p className="text-xs text-muted-foreground">これでcosmepikでの収益化準備が整いました</p>
            </div>
            <Link
              href="/p/mina_kbeauty"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              マイページへ戻る
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
```

---

## 2. 修正: `app/page.tsx`

### ヘッダーナビゲーションにリンクを追加

変更前:
```tsx
<div className="flex items-center gap-3">
  <Link 
    href="/p/mina_kbeauty"
    className="text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors border border-border rounded-full px-4 py-2"
  >
    プロフィール画面
  </Link>
  <Link 
    href="/signup"
    className="text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors"
  >
    SIGN UP
  </Link>
</div>
```

変更後:
```tsx
<div className="flex items-center gap-2 md:gap-3">
  <Link 
    href="/guide/rakuten-affiliate"
    className="text-[10px] md:text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors border border-border rounded-full px-2 md:px-4 py-1.5 md:py-2"
  >
    収益化ガイド
  </Link>
  <Link 
    href="/p/mina_kbeauty"
    className="hidden sm:block text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors border border-border rounded-full px-4 py-2"
  >
    プロフィール画面
  </Link>
  <Link 
    href="/signup"
    className="text-[10px] md:text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors"
  >
    SIGN UP
  </Link>
</div>
```

---

## 使用スクリーンショット画像

| 順番 | ファイル名 | URL | 用途 |
|---|---|---|---|
| 1 | IMG_5998 | `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5998-qFU2sbDVM2DdDZ6UtANzjmLbE2lbnE.jpg` | トップページ |
| 2 | IMG_6001 | `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6001-OxPXRotRoJJwx3NfHJK6qpmymkq9fn.jpg` | 規約同意モーダル |
| 3 | IMG_6003 | `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6003-E7hagvzAbym0By15cJSypwgpMUONrU.jpg` | サイドバーメニュー |
| 4 | IMG_6004 | `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6004-zT6cGyh7USkfKfvKC7H6cSEfrpNCfr.jpg` | サイト情報登録フォーム |
| 5 | IMG_6005 | `https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6005-SMU6yezZdiCLzVghhmsdlt36jY3h7S.jpg` | アフィリエイトID確認ページ |

---

## デザインポイント

| 要素 | スタイル |
|---|---|
| ステップ番号 | `bg-primary` 丸、縦線でつなぐタイムラインUI |
| 画像サイズ | `max-w-[200px]` でコンパクトに |
| サブステップ | `ChevronRight` アイコン付きリスト |
| 警告 | `bg-amber-500/10` + `AlertCircle` アイコン |
| 完了ノート | `bg-primary/5` + `CheckCircle2` アイコン |
| IDコピー | クリックで `bg-green-500` に変化 |
| ヘッダー | `sticky top-0` + `backdrop-blur-sm` |

---

## 依存関係

- `next/image` - 画像最適化
- `next/link` - ルーティング
- `lucide-react` - アイコン（ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Copy, ChevronRight）
- `@/lib/utils` - `cn` 関数
- `@/components/cosmepik-logo` - ロゴコンポーネント
