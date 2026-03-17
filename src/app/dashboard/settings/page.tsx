"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Ticket } from "lucide-react";
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
  const [inviteCode, setInviteCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

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

{/* 招待コード入力 */}
        <section className="mt-8 rounded-xl border border-border bg-muted/20 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Ticket className="h-5 w-5 text-primary" />
            招待コード
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            招待コード（数字6桁）を入力して、コスメセットを受け取ります。
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setClaimError(null);
              }}
              placeholder="000000"
              className="w-full max-w-[200px] rounded-lg border border-input bg-background px-3 py-2 font-mono text-lg tracking-widest placeholder:text-muted-foreground"
              disabled={claiming}
            />
            <button
              type="button"
              onClick={async () => {
                if (inviteCode.length !== 6) {
                  setClaimError("6桁の数字を入力してください");
                  return;
                }
                setClaimError(null);
                setClaiming(true);
                try {
                  const res = await fetch("/api/invite/claim", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: inviteCode }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setClaimError(data.error ?? "適用に失敗しました");
                    return;
                  }
                  setInviteCode("");
                  toast.success("コスメセットが反映されました！");
                  router.refresh();
                } catch {
                  setClaimError("適用に失敗しました");
                } finally {
                  setClaiming(false);
                }
              }}
              disabled={claiming}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {claiming ? "適用中..." : "適用"}
            </button>
          </div>
          {claimError && (
            <p className="mt-2 text-sm text-destructive">{claimError}</p>
          )}
        </section>

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
