"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Sparkles, Image, Palette, X, LayoutGrid, Settings, CheckCircle2 } from "lucide-react";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";

const benefits = [
  {
    icon: LayoutGrid,
    title: "複数メイクレシピ作成",
    description: "メイクレシピを複数作成可能に。ルーティン別・季節別など、テーマごとにコスメをまとめられます。",
  },
  {
    icon: X,
    title: "バナー広告消去",
    description: "公開ページのバナー広告を非表示に。すっきりした見た目でファンに届けます。",
  },
  {
    icon: Image,
    title: "ロゴ消去",
    description: "公開ページのロゴを非表示に。あなたのブランドに集中したページに。",
  },
  {
    icon: Palette,
    title: "限定壁紙の解放",
    description: "プレミアム限定の壁紙デザインが使えるように。公開ページをより魅力的に。",
  },
];

export default function PremiumPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    fetch("/api/premium/me")
      .then((r) => r.json())
      .then((d) => setIsPremium(d.premium === true))
      .catch(() => setIsPremium(false));
  }, []);

  const handleUpgradeToPremium = async () => {
    setUpgradeError(null);
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUpgradeError(data.error ?? "エラーが発生しました。");
        setUpgrading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setUpgradeError("Checkout URL を取得できませんでした。");
    } catch {
      setUpgradeError("エラーが発生しました。");
    }
    setUpgrading(false);
  };

  const handleOpenPortal = async () => {
    setUpgradeError(null);
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUpgradeError(data.error ?? "エラーが発生しました。");
        setOpeningPortal(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setUpgradeError("ポータルURLを取得できませんでした。");
    } catch {
      setUpgradeError("エラーが発生しました。");
    }
    setOpeningPortal(false);
  };

  return (
    <main className="min-h-screen">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← ダッシュボード
          </Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-500/10 p-4">
            <Crown className="h-12 w-12 text-amber-500" aria-hidden />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-foreground">
            プレミアムプラン
          </h1>
          {isPremium ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              プレミアム利用中
            </div>
          ) : (
            <p className="text-muted-foreground">
              公開ページをより快適に。バナー広告消去・ロゴ消去・限定壁紙で、あなたのコスメページをワンランク上へ。
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="mb-12 space-y-6">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Icon className="h-6 w-6 text-amber-500" aria-hidden />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA / プラン管理 */}
        {isPremium ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-500" aria-hidden />
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                プレミアム特典が有効です
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                プランの変更・お支払い方法の更新・解約はこちらから行えます。
              </p>
              {upgradeError && (
                <p className="mb-4 text-sm text-destructive">{upgradeError}</p>
              )}
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={openingPortal}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground py-4 px-8 font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                <Settings className="h-5 w-5" aria-hidden />
                {openingPortal ? "読み込み中..." : "プランを管理する"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-6 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-500" aria-hidden />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              プレミアムで公開ページをアップグレード
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              いつでも解約可能。まずはお試しください。
            </p>
            {upgradeError && (
              <p className="mb-4 text-sm text-destructive">{upgradeError}</p>
            )}
            <button
              type="button"
              onClick={handleUpgradeToPremium}
              disabled={upgrading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 py-4 px-8 font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              <Crown className="h-5 w-5" aria-hidden />
              {upgrading ? "処理中..." : "プレミアムにアップグレード"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
