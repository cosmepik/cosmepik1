"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Globe, Home, BarChart2, Settings, LogOut, ChevronRight, DollarSign, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/profile-context";
import { useUser } from "@/hooks/use-user";
import { getStorageType } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { supabase as supabaseFallback } from "@/lib/supabase";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = (
  username: string
): { icon: typeof Globe; label: string; href: string; description: string }[] => [
  {
    icon: Globe,
    label: "トップページに戻る",
    href: "/",
    description: "cosmepikのトップへ",
  },
  {
    icon: Home,
    label: "ダッシュボードに戻る",
    href: "/dashboard",
    description: "管理画面へ",
  },
  {
    icon: BarChart2,
    label: "アクセス解析",
    href: "/dashboard/analytics",
    description: "訪問者データを確認",
  },
  {
    icon: Settings,
    label: "アカウント設定",
    href: "/dashboard/settings",
    description: "アカウント各種設定",
  },
  {
    icon: Crown,
    label: "プレミアムプラン",
    href: "/dashboard/premium",
    description: "バナー広告消去・限定壁紙",
  },
];

const revenueItem = {
  icon: DollarSign,
  label: "収益化（ベータ版）",
  href: "/dashboard/revenue",
  description: "楽天アフィリエイトID設定",
};

const ADMIN_EMAIL = "cosmepik.team@gmail.com";

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { profile } = useProfile();
  const { user } = useUser();
  const username = profile.username || "demo";
  const [dbLabel, setDbLabel] = useState<string>("");

  const email = user?.email ?? "";
  const initial = email ? email.charAt(0).toUpperCase() : "?";
  const isAdmin = email === ADMIN_EMAIL;

  useEffect(() => {
    fetch("/api/db-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.storage === "supabase") {
          setDbLabel(d.projectId ? `supabase: ${d.projectId}` : "supabase");
        } else {
          setDbLabel("localStorage");
        }
      })
      .catch(() => setDbLabel(getStorageType()));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const items = menuItems(username);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="サイドメニュー"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: アバター＋メールアドレス＋閉じるボタン */}
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 text-xs font-bold text-primary">
              {initial}
            </div>
            <p
              className="w-full truncate text-left text-xs font-medium text-foreground"
              title={email || undefined}
            >
              {email || "未ログイン"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="メニューを閉じる"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-accent"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-1 flex-col items-start text-left">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground">{item.description}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href={revenueItem.href}
                onClick={onClose}
                className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-accent"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <revenueItem.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <div className="flex flex-1 flex-col items-start text-left">
                  <span className="text-sm font-medium text-foreground">{revenueItem.label}</span>
                  <span className="text-[11px] text-muted-foreground">{revenueItem.description}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/dashboard/admin"
                  onClick={onClose}
                  className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-accent"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <Shield className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-1 flex-col items-start text-left">
                    <span className="text-sm font-medium text-foreground">管理</span>
                    <span className="text-[11px] text-muted-foreground">ユーザー一覧・閲覧数</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            )}
          </ul>

          {/* Divider */}
          <div className="mx-3 my-3 h-px bg-border/60" />

          {/* Sign out */}
          <button
            className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-destructive/8"
            onClick={async () => {
              onClose();
              const supabase = createClient() ?? supabaseFallback;
              if (supabase) {
                await supabase.auth.signOut();
                document.cookie = "cosmepik_demo=; path=/; max-age=0";
                window.location.href = "/";
              }
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-white">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex flex-1 flex-col items-start text-left">
              <span className="text-sm font-medium text-destructive">サインアウト</span>
              <span className="text-[11px] text-muted-foreground">アカウントからログアウト</span>
            </div>
          </button>
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground">cosmepik v1.1</span>
            <span
              className="max-w-[140px] truncate text-[10px] text-muted-foreground/70"
              title={dbLabel || "(取得中…)"}
            >
              ({dbLabel || "…"})
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            &copy; 2026 cosmepik. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
