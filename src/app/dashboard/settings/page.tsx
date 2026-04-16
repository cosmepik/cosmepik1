"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { toast } from "sonner";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useUser } from "@/hooks/use-user";

/** アカウント設定：UIBASE 完全準拠 */
export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/premium/me")
      .then((res) => res.json())
      .then((data) => setIsPremium(Boolean(data?.premium)))
      .catch(() => setIsPremium(false));
  }, []);
  const [confirmText, setConfirmText] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const handleWithdraw = async () => {
    if (confirmText !== "退会") {
      setWithdrawError('「退会」と入力してください。');
      return;
    }
    setWithdrawError(null);
    setWithdrawing(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWithdrawError(data.error ?? "退会処理に失敗しました。");
        setWithdrawing(false);
        return;
      }
      router.push("/?lp=1");
      router.refresh();
    } catch {
      setWithdrawError("退会処理に失敗しました。");
      setWithdrawing(false);
    }
  };

  return (
    <main className="min-h-screen">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← ダッシュボード</Link>
        }
      />

      <div className="mx-auto max-w-2xl px-4 pb-8 pt-6">
        <h1 className="mb-6 text-xl font-bold text-foreground">アカウント設定</h1>

        <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">現在のプラン</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {isPremium === null ? (
              <span className="text-muted-foreground">読み込み中...</span>
            ) : isPremium ? (
              <span className="inline-flex items-center gap-1.5 text-amber-600">
                <Crown className="h-4 w-4" aria-hidden />
                プレミアムプラン
              </span>
            ) : (
              "無料プラン"
            )}
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/premium"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/5 py-3 px-6 font-medium text-amber-600 transition-colors hover:bg-amber-500/10"
          >
            <Crown className="h-4 w-4" aria-hidden />
            プレミアムプランに登録する
          </Link>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>バナー広告消去</li>
            <li>ロゴ消去</li>
            <li>限定壁紙の解放</li>
          </ul>
        </div>

        {/* 退会 */}
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-2 text-lg font-semibold text-foreground">退会する</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            退会すると、プロフィール・コスメリストなどすべてのデータが削除され、復元できません。この操作は取り消せません。
          </p>
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
            <p className="mb-3 text-sm text-foreground">
              退会する場合は、以下の入力欄に <strong>退会</strong> と入力してください。
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="退会"
              className="mb-3 w-full max-w-xs rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              disabled={withdrawing}
            />
            {withdrawError && (
              <p className="mb-3 text-sm text-destructive">{withdrawError}</p>
            )}
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing || confirmText !== "退会"}
              className="rounded-lg border border-destructive bg-white px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {withdrawing ? "処理中..." : "アカウントを削除して退会する"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
