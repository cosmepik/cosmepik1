"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gift } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SideMenu } from "@/components/cosme-link/side-menu";
import { toast } from "sonner";

export default function ClaimRecipePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = /^\d{5}$/.test(code);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/claim-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "受け取りに失敗しました");
        return;
      }
      toast.success(`「${data.name}」を受け取りました！`);
      router.push("/dashboard");
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50/40 via-background to-background">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto max-w-md px-4 pb-12 pt-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← ダッシュボード
        </Link>

        <h1 className="mb-2 text-xl font-bold text-foreground">メイクレシピを受け取る</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          ５桁の受け取りコードを入力すると、作成済みのメイクレシピがあなたのアカウントに追加されます
        </p>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-foreground">
            受け取りコード
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 5);
              setCode(v);
            }}
            placeholder="12345"
            className="mb-6 w-full rounded-xl border border-border px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoFocus
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "受け取り中..." : "レシピを受け取る"}
          </button>
        </div>
      </div>
    </main>
  );
}
