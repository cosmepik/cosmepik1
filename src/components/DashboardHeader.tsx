"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CosmepikLogo } from "@/components/cosmepik-logo";
import { useUser } from "@/hooks/use-user";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
}

/** ログイン中のプロフィールアイコン（クリックでメールアドレス表示） */
export function ProfileIcon({ user, onClick, className }: { user: User; onClick?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const meta = user.user_metadata ?? {};
  const appProvider = user.app_metadata?.provider as string | undefined;
  const metaProvider = meta.provider as string | undefined;
  const isPlainEmail = appProvider === "email" && !metaProvider;
  const avatarUrl = !isPlainEmail ? (meta.avatar_url ?? meta.picture ?? undefined) : undefined;
  const initial = (user.email?.[0] ?? meta.name?.[0] ?? meta.full_name?.[0] ?? "?").toUpperCase();

  // Google: full_name, name, email | X: user_name, name, email
  const displayName = meta.full_name ?? meta.name ?? (meta.user_name ? `@${meta.user_name}` : null);
  const email = user.email ?? meta.email ?? null;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className={`flex items-center justify-center rounded-full overflow-hidden border-2 border-border bg-secondary hover:bg-accent transition-colors shrink-0 ${className ?? ""}`}
        aria-label="プロフィール"
        aria-expanded={open}
        style={{ width: 44, height: 44 }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{initial}</span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[240px] overflow-hidden rounded-xl border border-border bg-white/95 shadow-xl shadow-black/5 backdrop-blur-md"
          role="dialog"
          aria-label="アカウント情報"
        >
          <div className="border-b border-border/60 bg-muted/30 px-3.5 py-2.5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">
              アカウント情報
            </p>
          </div>
          <div className="space-y-2.5 px-3.5 py-3">
            {displayName && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  名前
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground" title={displayName}>
                  {displayName}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                メールアドレス
              </p>
              <p
                className="mt-0.5 truncate text-sm font-medium text-foreground"
                title={email ?? undefined}
              >
                {email ?? "未設定"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardHeader({ onMenuClick, rightContent }: DashboardHeaderProps) {
  const { user } = useUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center hover:opacity-80">
            <CosmepikLogo className="h-6" height={26} />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          {isLoggedIn && user && (
            <ProfileIcon user={user} onClick={onMenuClick} />
          )}
        </div>
      </div>
    </header>
  );
}
