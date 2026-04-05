"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CosmepikLogo } from "@/components/cosmepik-logo";

const steps = [
  {
    number: 1,
    title: "楽天アフィリエイトに登録する",
    titleLink: "https://affiliate.rakuten.co.jp/",
    description: "まずは楽天アフィリエイトの公式サイトでアカウントを作成します。",
    image: "/images/guide/rakuten-top.jpg",
    imageAlt: "楽天アフィリエイトトップページ",
    substeps: [
      {
        text: "楽天アフィリエイト公式サイトにアクセス",
        link: "https://affiliate.rakuten.co.jp/",
      },
      { text: "「新規登録」をクリック（楽天IDをお持ちの方はログイン）" },
      { text: "氏名・住所・メールアドレス・銀行口座などを入力" },
      { text: "規約に同意して登録完了" },
    ],
    agreementImage: "/images/guide/rakuten-agreement.jpg",
    agreementAlt: "規約同意画面",
  },
  {
    number: 2,
    title: "サイト情報を登録する",
    titleLink: "https://affiliate.rakuten.co.jp/user/sites",
    description: "cosmepikのURLを楽天アフィリエイトに登録します。これは必須の手順です。",
    image: "/images/guide/rakuten-sidebar.jpg",
    imageAlt: "サイドバーメニュー",
    substeps: [
      { text: "左上の三本線アイコンからサイドバーを開く" },
      { text: "「マイページ」→「サイト情報の登録」をクリック" },
      { text: "「追加登録」をクリック" },
    ],
    formImage: "/images/guide/rakuten-form.png",
    formAlt: "サイト情報登録フォーム",
    formFields: [
      { label: "運営サイト名", example: "cosmepik.me", hint: "「cosmepik.me」でOK！自由に決められます" },
      { label: "運営サイトURL", example: "https://cosmepik.me", hint: "cosmepikの公開プロフURLをそのまま貼り付けてもOK" },
      { label: "サイトのジャンル", example: "美容" },
      { label: "扱う商品ジャンル", example: "美容・コスメ・香水" },
    ],
    warning:
      "サイト情報の登録は必須です。未登録のままアフィリエイトリンクを掲載すると規約違反になる場合があります。",
  },
  {
    number: 3,
    title: "アフィリエイトIDを確認する",
    titleLink: "https://webservice.rakuten.co.jp/account_affiliate_id/",
    description: "あなた専用のアフィリエイトIDを取得します。",
    image: "/images/guide/rakuten-id.jpg",
    imageAlt: "アフィリエイトID確認ページ",
    substeps: [
      {
        text: "アフィリエイトID確認ページにアクセス",
        link: "https://webservice.rakuten.co.jp/account_affiliate_id/",
      },
      { text: "楽天アフィリエイトで使った楽天IDでログイン" },
      { text: "表示されたアフィリエイトIDをコピー" },
    ],
    idExample: "0ea12345.ab.cd",
  },
  {
    number: 4,
    title: "cosmepikでIDを設定する",
    titleLink: "/dashboard/revenue",
    description: "取得したアフィリエイトIDをcosmepikに設定すれば完了です。",
    substeps: [
      { text: "cosmepikにログイン" },
      { text: "サイドメニュー（≡）から「収益化」を開く" },
      { text: "楽天アフィリエイトID欄にIDを入力" },
      { text: "「保存」をクリック" },
    ],
    note: "設定したIDは、すべてのメイクレシピに自動で適用されます。",
  },
];

function StepCard({
  step,
  isLast,
}: {
  step: (typeof steps)[0];
  isLast: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <h3 className="mb-1 text-lg font-bold text-foreground">{step.title}</h3>
          {step.titleLink && (
            <p className="mb-2 text-sm">
              {step.titleLink.startsWith("http") ? (
                <a
                  href={step.titleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {step.titleLink}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ) : (
                <Link
                  href={step.titleLink}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {step.titleLink}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              )}
            </p>
          )}
          <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>

          {/* Main image */}
          {step.image && (
            <div className="relative mb-4 max-w-[200px] overflow-hidden rounded-xl border border-border shadow-sm">
              <Image
                src={step.image}
                alt={step.imageAlt || ""}
                width={200}
                height={150}
                className="h-auto w-full"
              />
            </div>
          )}

          {/* Substeps */}
          <ul className="mb-4 space-y-2.5">
            {step.substeps.map((substep, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ChevronRight className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{substep.text}</span>
                  {"link" in substep && substep.link && (
                    <p className="mt-0.5 text-xs">
                      <a
                        href={substep.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {substep.link}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Agreement image for step 1 */}
          {step.agreementImage && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                規約同意画面
              </p>
              <div className="relative max-w-[200px] overflow-hidden rounded-xl border border-border shadow-sm">
                <Image
                  src={step.agreementImage}
                  alt={step.agreementAlt || ""}
                  width={200}
                  height={150}
                  className="h-auto w-full"
                />
              </div>
            </div>
          )}

          {/* Form image and fields for step 2 */}
          {step.formImage && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                入力フォーム
              </p>
              <div className="relative mb-4 max-w-[200px] overflow-hidden rounded-xl border border-border shadow-sm">
                <Image
                  src={step.formImage}
                  alt={step.formAlt || ""}
                  width={200}
                  height={250}
                  className="h-auto w-full"
                />
              </div>

              {/* Form field examples */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <p className="text-xs font-semibold text-foreground">入力例</p>
                {step.formFields?.map((field, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {field.label}
                    </span>
                    <code className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground">
                      {field.example}
                    </code>
                    {"hint" in field && field.hint && (
                      <span className="text-[10px] text-muted-foreground">{field.hint}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for step 2 */}
          {step.warning && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {step.warning}
              </p>
            </div>
          )}

          {/* ID example for step 3 */}
          {step.idExample && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                アフィリエイトIDの例
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 font-mono text-sm text-primary">
                  {step.idExample}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(step.idExample!)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-secondary text-foreground hover:bg-accent"
                  )}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Note for step 4 */}
          {step.note && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/10 bg-primary/5 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">{step.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RakutenAffiliateGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>戻る</span>
          </Link>
          <CosmepikLogo className="h-5 w-auto" height={20} />
          <div className="w-14" />
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            収益化ガイド
          </div>
          <h1 className="mb-3 text-2xl font-bold text-foreground">
            楽天アフィリエイト
            <br />
            登録手順
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            cosmepikでコスメを紹介して収益を得るために、
            <br className="hidden sm:block" />
            楽天アフィリエイトの設定を完了しましょう。
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-pink-500/10 via-primary/10 to-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="mb-1 text-sm font-semibold text-foreground">
                収益の仕組み
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
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
            <StepCard
              key={step.number}
              step={step}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 px-8 py-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <div>
              <h3 className="mb-1 text-base font-bold text-foreground">
                設定完了!
              </h3>
              <p className="text-xs text-muted-foreground">
                これでcosmepikでの収益化準備が整いました
              </p>
            </div>
            <Link
              href="/dashboard/revenue"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              収益化ページへ
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
