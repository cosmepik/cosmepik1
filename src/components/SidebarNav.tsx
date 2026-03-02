"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, BarChart3, Settings, LogOut, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SidebarView = "menu" | "analytics";

interface SidebarNavProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarNav({ open, onClose }: SidebarNavProps) {
  const [view, setView] = useState<SidebarView>("menu");

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      document.cookie = "cosmepik_demo=; path=/; max-age=0";
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* サイドバー */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] transform border-r border-border bg-white shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border bg-white p-4">
            <span className="font-medium text-foreground">
              {view === "menu" && "メニュー"}
              {view === "analytics" && "アクセス解析"}
            </span>
            {view !== "menu" ? (
              <button
                type="button"
                onClick={() => setView("menu")}
                className="text-sm text-muted-foreground hover:text-green"
              >
                戻る
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-2 -m-2 text-muted-foreground hover:text-foreground"
                aria-label="閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {view === "menu" && (
              <nav className="space-y-1">
                <Link
                  href="/?lp=1"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent"
                >
                  <Globe className="h-5 w-5 text-green" />
                  <span>トップページに戻る</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent"
                >
                  <Home className="h-5 w-5 text-green" />
                  <span>ホームに戻る</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setView("analytics")}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent"
                >
                  <BarChart3 className="h-5 w-5 text-green" />
                  <span>アクセス解析</span>
                </button>
                <Link
                  href="/dashboard/settings"
                  onClick={onClose}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent"
                >
                  <Settings className="h-5 w-5 text-green" />
                  <span>アカウント設定</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground transition-colors hover:bg-accent"
                >
                  <LogOut className="h-5 w-5 text-green" />
                  <span>サインアウト</span>
                </button>
              </nav>
            )}
            {view === "analytics" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
                  <p className="mb-2 text-sm text-muted-foreground">公開ページの閲覧数など</p>
                  <p className="text-xs text-muted-foreground">アクセス解析は準備中です。</p>
                  <p className="mt-1 text-xs text-muted-foreground">プレミアムプランでご提供予定です。</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
